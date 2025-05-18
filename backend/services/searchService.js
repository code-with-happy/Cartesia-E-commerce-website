const { Client } = require('@elastic/elasticsearch');
const algoliasearch = require('algoliasearch');
const Product = require('../models/Product');

// Initialize Elasticsearch client
const elasticClient = new Client({
  node: process.env.ELASTIC_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTIC_USERNAME || '',
    password: process.env.ELASTIC_PASSWORD || '',
  },
});

// Initialize Algolia client
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);
const algoliaIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME || 'products');

// Create Elasticsearch index if it doesn't exist
const createElasticIndex = async () => {
  try {
    const indexExists = await elasticClient.indices.exists({ index: 'products' });
    
    if (!indexExists) {
      await elasticClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              description: { type: 'text' },
              brand: { type: 'keyword' },
              category: { type: 'keyword' },
              tags: { type: 'keyword' },
              price: { type: 'float' },
              store: { type: 'keyword' },
              rating: { type: 'float' },
              attributes: { type: 'object' },
            },
          },
        },
      });
      
      console.log('Elasticsearch products index created');
    }
  } catch (error) {
    console.error('Error creating Elasticsearch index:', error);
  }
};

// Sync products to search engines
const syncProductsToSearchEngines = async () => {
  try {
    // Get all products from database
    const products = await Product.find({ isActive: true }).lean();
    
    if (products.length === 0) {
      return;
    }
    
    // Prepare data for indexing
    const elasticBulkBody = [];
    const algoliaRecords = [];
    
    products.forEach(product => {
      // Format data for Elasticsearch
      elasticBulkBody.push(
        { index: { _index: 'products', _id: product._id.toString() } },
        {
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category.toString(),
          tags: product.tags,
          price: product.price,
          store: product.store,
          rating: product.rating,
          attributes: Object.fromEntries(product.attributes),
          searchVector: product.searchVector,
        }
      );
      
      // Format data for Algolia
      algoliaRecords.push({
        objectID: product._id.toString(),
        name: product.name,
        description: product.description,
        brand: product.brand,
        category: product.category.toString(),
        tags: product.tags,
        price: product.price,
        store: product.store,
        rating: product.rating,
        attributes: Object.fromEntries(product.attributes),
      });
    });
    
    // Index to Elasticsearch
    if (process.env.ELASTIC_NODE) {
      await createElasticIndex();
      const elasticResponse = await elasticClient.bulk({ body: elasticBulkBody });
      
      if (elasticResponse.errors) {
        console.error('Elasticsearch bulk indexing had errors:', elasticResponse.errors);
      } else {
        console.log(`Indexed ${products.length} products to Elasticsearch`);
      }
    }
    
    // Index to Algolia
    if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY) {
      const algoliaResponse = await algoliaIndex.saveObjects(algoliaRecords);
      console.log(`Indexed ${algoliaResponse.objectIDs.length} products to Algolia`);
    }
  } catch (error) {
    console.error('Error syncing products to search engines:', error);
  }
};

// Search products using Elasticsearch
const searchProductsWithElasticsearch = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    
    // Build search query
    const searchBody = {
      from: offset,
      size: limit,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^3', 'description', 'brand^2', 'tags^2', 'searchVector'],
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [],
        },
      },
      sort: [],
    };
    
    // Add filters
    if (filters.category) {
      searchBody.query.bool.filter.push({
        term: { category: filters.category },
      });
    }
    
    if (filters.store) {
      searchBody.query.bool.filter.push({
        term: { store: filters.store },
      });
    }
    
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = { range: { price: {} } };
      
      if (filters.minPrice) {
        priceRange.range.price.gte = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        priceRange.range.price.lte = filters.maxPrice;
      }
      
      searchBody.query.bool.filter.push(priceRange);
    }
    
    if (filters.rating) {
      searchBody.query.bool.filter.push({
        range: { rating: { gte: filters.rating } },
      });
    }
    
    // Add sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          searchBody.sort.push({ price: 'asc' });
          break;
        case 'price_desc':
          searchBody.sort.push({ price: 'desc' });
          break;
        case 'rating_desc':
          searchBody.sort.push({ rating: 'desc' });
          break;
        default:
          // Default to relevance
          break;
      }
    }
    
    // Execute search
    const response = await elasticClient.search({
      index: 'products',
      body: searchBody,
    });
    
    // Format results
    const hits = response.hits.hits;
    const total = response.hits.total.value;
    
    const results = hits.map(hit => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));
    
    return {
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    throw error;
  }
};

// Search products using Algolia
const searchProductsWithAlgolia = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    // Build search params
    const searchParams = {
      page: page - 1, // Algolia pages are 0-indexed
      hitsPerPage: limit,
    };
    
    // Add filters
    const algoliaFilters = [];
    
    if (filters.category) {
      algoliaFilters.push(`category:${filters.category}`);
    }
    
    if (filters.store) {
      algoliaFilters.push(`store:${filters.store}`);
    }
    
    if (filters.minPrice || filters.maxPrice) {
      let priceFilter = 'price:';
      
      if (filters.minPrice && filters.maxPrice) {
        priceFilter += `${filters.minPrice} TO ${filters.maxPrice}`;
      } else if (filters.minPrice) {
        priceFilter += `>= ${filters.minPrice}`;
      } else if (filters.maxPrice) {
        priceFilter += `<= ${filters.maxPrice}`;
      }
      
      algoliaFilters.push(priceFilter);
    }
    
    if (filters.rating) {
      algoliaFilters.push(`rating >= ${filters.rating}`);
    }
    
    if (algoliaFilters.length > 0) {
      searchParams.filters = algoliaFilters.join(' AND ');
    }
    
    // Add sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          searchParams.sortBy = ['price:asc'];
          break;
        case 'price_desc':
          searchParams.sortBy = ['price:desc'];
          break;
        case 'rating_desc':
          searchParams.sortBy = ['rating:desc'];
          break;
        default:
          // Default to relevance
          break;
      }
    }
    
    // Execute search
    const response = await algoliaIndex.search(query, searchParams);
    
    // Format results
    const results = response.hits.map(hit => ({
      id: hit.objectID,
      ...hit,
      score: hit._rankingInfo?.score,
    }));
    
    return {
      results,
      pagination: {
        total: response.nbHits,
        page,
        limit,
        totalPages: response.nbPages,
      },
    };
  } catch (error) {
    console.error('Algolia search error:', error);
    throw error;
  }
};

// Search products using preferred search engine or fallback to database
const searchProducts = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    // Try Elasticsearch first
    if (process.env.ELASTIC_NODE) {
      try {
        return await searchProductsWithElasticsearch(query, filters, page, limit);
      } catch (error) {
        console.error('Elasticsearch search failed, falling back to Algolia:', error);
      }
    }
    
    // Try Algolia second
    if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY) {
      try {
        return await searchProductsWithAlgolia(query, filters, page, limit);
      } catch (error) {
        console.error('Algolia search failed, falling back to database:', error);
      }
    }
    
    // Fallback to database search
    const dbQuery = { isActive: true };
    
    // Basic text search (not as powerful as Elasticsearch/Algolia)
    if (query) {
      dbQuery.$text = { $search: query };
    }
    
    // Apply filters
    if (filters.category) {
      dbQuery.category = filters.category;
    }
    
    if (filters.store) {
      dbQuery.store = filters.store;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      dbQuery.price = {};
      
      if (filters.minPrice) {
        dbQuery.price.$gte = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        dbQuery.price.$lte = filters.maxPrice;
      }
    }
    
    if (filters.rating) {
      dbQuery.rating = { $gte: filters.rating };
    }
    
    // Build sort options
    let sortOptions = {};
    
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          sortOptions = { price: 1 };
          break;
        case 'price_desc':
          sortOptions = { price: -1 };
          break;
        case 'rating_desc':
          sortOptions = { rating: -1 };
          break;
        default:
          // Default sort by recency
          sortOptions = { createdAt: -1 };
          break;
      }
    } else {
      // If using text search, sort by text score
      if (query) {
        sortOptions = { score: { $meta: 'textScore' } };
      } else {
        sortOptions = { createdAt: -1 };
      }
    }
    
    // Execute query with pagination
    const total = await Product.countDocuments(dbQuery);
    const products = await Product.find(dbQuery)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    return {
      results: products.map(product => ({
        ...product,
        id: product._id.toString(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

module.exports = {
  syncProductsToSearchEngines,
  searchProducts,
  searchProductsWithElasticsearch,
  searchProductsWithAlgolia,
}; 