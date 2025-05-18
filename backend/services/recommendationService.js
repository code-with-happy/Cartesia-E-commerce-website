const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Get personalized recommendations for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} Array of recommended products
 */
const getPersonalizedRecommendations = async (userId, limit = 10) => {
  try {
    // If no user ID provided, return popular products
    if (!userId) {
      return getPopularProducts(limit);
    }

    // Get user data and purchase history
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return getPopularProducts(limit);
    }
    
    // Get user's orders to analyze purchase history
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .lean();
    
    // Extract unique categories and product IDs purchased by user
    const purchasedProductIds = new Set();
    const categoryFrequency = {};
    const brandFrequency = {};
    const storeFrequency = {};
    
    // Calculate frequencies from order history
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        
        if (product) {
          // Add to purchased products
          purchasedProductIds.add(product._id.toString());
          
          // Count category frequency
          const categoryId = product.category.toString();
          categoryFrequency[categoryId] = (categoryFrequency[categoryId] || 0) + 1;
          
          // Count brand frequency
          if (product.brand) {
            brandFrequency[product.brand] = (brandFrequency[product.brand] || 0) + 1;
          }
          
          // Count store frequency
          storeFrequency[product.store] = (storeFrequency[product.store] || 0) + 1;
        }
      });
    });
    
    // Get frequently bought categories
    const preferredCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    // Get frequently bought brands
    const preferredBrands = Object.entries(brandFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    // Get frequently used stores
    const preferredStores = Object.entries(storeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    // Get products from user's wishlist if available
    let wishlistProducts = [];
    if (user.wishlist && user.wishlist.length > 0) {
      wishlistProducts = await Product.find({
        _id: { $in: user.wishlist },
        isActive: true,
      }).limit(5).lean();
    }
    
    // Get similar products based on user preferences
    // This query prioritizes:
    // 1. Products in preferred categories
    // 2. Products from preferred brands
    // 3. Products from preferred stores
    // 4. Products with good ratings
    // But excludes already purchased products
    const recommendedProducts = await Product.find({
      _id: { $nin: Array.from(purchasedProductIds) },
      isActive: true,
      $or: [
        { category: { $in: preferredCategories } },
        { brand: { $in: preferredBrands } },
        { store: { $in: preferredStores } },
      ],
    })
      .sort({ rating: -1 })
      .limit(limit * 2)
      .lean();
    
    // Combine and deduplicate recommendations
    const allRecommendations = [...wishlistProducts, ...recommendedProducts];
    const uniqueRecommendations = [];
    const seenIds = new Set();
    
    allRecommendations.forEach(product => {
      const productId = product._id.toString();
      if (!seenIds.has(productId)) {
        seenIds.add(productId);
        uniqueRecommendations.push(product);
      }
    });
    
    // Return limited number of recommendations
    return uniqueRecommendations.slice(0, limit);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    // Fallback to popular products if something goes wrong
    return getPopularProducts(limit);
  }
};

/**
 * Get related products for a specific product
 * @param {string} productId - Product ID
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} Array of related products
 */
const getRelatedProducts = async (productId, limit = 8) => {
  try {
    // Find the reference product
    const product = await Product.findById(productId).lean();
    
    if (!product) {
      return [];
    }
    
    // Get products from the same category
    const relatedByCategory = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
    })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    
    // If we have enough related products by category, return them
    if (relatedByCategory.length >= limit) {
      return relatedByCategory;
    }
    
    // Otherwise, get products from the same brand or store
    const additionalQuery = {
      _id: { $ne: productId, $nin: relatedByCategory.map(p => p._id) },
      isActive: true,
      $or: [],
    };
    
    if (product.brand) {
      additionalQuery.$or.push({ brand: product.brand });
    }
    
    if (product.store) {
      additionalQuery.$or.push({ store: product.store });
    }
    
    // Only run this query if we have brand or store to match
    let additionalProducts = [];
    if (additionalQuery.$or.length > 0) {
      additionalProducts = await Product.find(additionalQuery)
        .sort({ rating: -1 })
        .limit(limit - relatedByCategory.length)
        .lean();
    }
    
    // Combine results
    return [...relatedByCategory, ...additionalProducts];
  } catch (error) {
    console.error('Error getting related products:', error);
    return [];
  }
};

/**
 * Get popular products
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Array of popular products
 */
const getPopularProducts = async (limit = 10) => {
  try {
    // Get products with high ratings and review counts
    const popularProducts = await Product.find({
      isActive: true,
      rating: { $gte: 4 },
      reviewCount: { $gte: 5 },
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();
    
    if (popularProducts.length >= limit) {
      return popularProducts;
    }
    
    // If we don't have enough products, get featured products
    const featuredProducts = await Product.find({
      isActive: true,
      isFeatured: true,
      _id: { $nin: popularProducts.map(p => p._id) },
    })
      .limit(limit - popularProducts.length)
      .lean();
    
    // Combine results
    return [...popularProducts, ...featuredProducts];
  } catch (error) {
    console.error('Error getting popular products:', error);
    return [];
  }
};

/**
 * Get products on sale
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Array of products on sale
 */
const getProductsOnSale = async (limit = 10) => {
  try {
    // Get products marked as on sale
    const onSaleProducts = await Product.find({
      isActive: true,
      isOnSale: true,
      discount: { $gt: 0 },
    })
      .sort({ discount: -1 })
      .limit(limit)
      .lean();
    
    return onSaleProducts;
  } catch (error) {
    console.error('Error getting products on sale:', error);
    return [];
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getRelatedProducts,
  getPopularProducts,
  getProductsOnSale,
}; 