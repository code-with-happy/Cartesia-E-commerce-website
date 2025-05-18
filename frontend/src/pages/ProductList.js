import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';

const ProductList = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'popularity',
    store: '',
  });

  // Mock data for now - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProducts = Array(12).fill().map((_, index) => ({
        id: `product-${index}`,
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${index + 1}`,
        price: 50 + Math.floor(Math.random() * 200),
        originalPrice: index % 3 === 0 ? 100 + Math.floor(Math.random() * 300) : null,
        discount: index % 3 === 0 ? 0.2 : null,
        image: `https://via.placeholder.com/300x300?text=${category}+${index + 1}`,
        rating: 3 + Math.random() * 2,
        reviewCount: Math.floor(Math.random() * 500),
        store: ['Amazon', 'Flipkart', 'Myntra'][Math.floor(Math.random() * 3)],
      }));
      
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, [category, query]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    // In a real app, this would trigger an API call with the filters
    // Here we're just simulating the loading state
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const title = query ? `Search results for "${query}"` : `${categoryTitle}`;

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h1>{title}</h1>
        <p>{products.length} products found</p>
      </div>
      
      <div className="product-list-container">
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Customer Rating</h3>
            <select 
              name="rating" 
              value={filters.rating} 
              onChange={handleFilterChange}
            >
              <option value="">All Ratings</option>
              <option value="4">4★ & Above</option>
              <option value="3">3★ & Above</option>
              <option value="2">2★ & Above</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Store</h3>
            <select 
              name="store" 
              value={filters.store} 
              onChange={handleFilterChange}
            >
              <option value="">All Stores</option>
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Myntra">Myntra</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Sort By</h3>
            <select 
              name="sort" 
              value={filters.sort} 
              onChange={handleFilterChange}
            >
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Customer Rating</option>
            </select>
          </div>
          
          <button 
            className="apply-filters-btn"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </aside>
        
        <div className="product-grid">
          {loading ? (
            <div className="loading-spinner">Loading products...</div>
          ) : (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList; 