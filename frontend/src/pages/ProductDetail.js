import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaRegHeart, FaExternalLinkAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlist, setWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Mock data for now - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock product data
      const mockProduct = {
        id,
        name: 'Premium Wireless Headphones',
        price: 129.99,
        originalPrice: 199.99,
        discount: 0.35,
        description: 'High-quality wireless headphones with noise cancellation, long battery life, and premium sound quality. Perfect for music lovers and professionals alike.',
        features: [
          'Active Noise Cancellation',
          '30-hour battery life',
          'Bluetooth 5.0 connectivity',
          'Built-in microphone for calls',
          'Foldable design for easy storage'
        ],
        specifications: {
          'Brand': 'AudioPro',
          'Model': 'WH-X1000',
          'Color': 'Matte Black',
          'Connectivity': 'Bluetooth 5.0',
          'Battery Life': '30 hours',
          'Weight': '250g'
        },
        images: [
          'https://via.placeholder.com/600x400?text=Headphones+Main',
          'https://via.placeholder.com/600x400?text=Headphones+Side',
          'https://via.placeholder.com/600x400?text=Headphones+Case'
        ],
        rating: 4.7,
        reviewCount: 128,
        store: 'Amazon',
        storeUrl: 'https://amazon.com',
        category: 'electronics',
        inventory: 25,
      };
      
      setProduct(mockProduct);
      
      // Mock related products
      const mockRelated = Array(4).fill().map((_, index) => ({
        id: `related-${index}`,
        name: `Related Headphones ${index + 1}`,
        price: 70 + Math.floor(Math.random() * 100),
        originalPrice: index % 2 === 0 ? 100 + Math.floor(Math.random() * 150) : null,
        discount: index % 2 === 0 ? 0.25 : null,
        image: `https://via.placeholder.com/300x300?text=Related+${index + 1}`,
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 100),
        store: ['Amazon', 'Flipkart', 'Myntra'][Math.floor(Math.random() * 3)],
      }));
      
      setRelatedProducts(mockRelated);
      setLoading(false);
    }, 800);
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.inventory || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.inventory || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // In a real app, you might show a success message or redirect
    }
  };

  const toggleWishlist = () => {
    setWishlist(!wishlist);
    // In a real app, you would save this to the user's profile
  };

  // Generate stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={`star-${i}`} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={`star-${i}`} className="star half" />);
      } else {
        stars.push(<FaRegStar key={`star-${i}`} className="star" />);
      }
    }

    return stars;
  };

  if (loading) {
    return <div className="loading-spinner">Loading product details...</div>;
  }

  if (!product) {
    return <div className="error-message">Product not found</div>;
  }

  // Calculate discount percentage
  const discountPercentage = product.discount 
    ? Math.round(product.discount * 100) 
    : (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <img src={product.images[0]} alt={product.name} />
            {discountPercentage && (
              <span className="discount-badge">-{discountPercentage}%</span>
            )}
          </div>
          <div className="thumbnail-images">
            {product.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`${product.name} view ${index + 1}`} 
                className={index === 0 ? 'active' : ''} 
              />
            ))}
          </div>
        </div>
        
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          
          <div className="product-meta">
            <div className="product-rating">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="review-count">({product.reviewCount} reviews)</span>
            </div>
            <div className="product-store">
              Sold by: <a href={product.storeUrl} target="_blank" rel="noopener noreferrer">{product.store} <FaExternalLinkAlt /></a>
            </div>
          </div>
          
          <div className="product-price">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          {product.inventory <= 5 && (
            <div className="low-stock">Only {product.inventory} left in stock!</div>
          )}
          
          <div className="product-actions">
            <div className="quantity-control">
              <button onClick={decrementQuantity} disabled={quantity <= 1}>-</button>
              <input 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange} 
                min="1" 
                max={product.inventory} 
              />
              <button onClick={incrementQuantity} disabled={quantity >= product.inventory}>+</button>
            </div>
            
            <div className="action-buttons">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <FaShoppingCart /> Add to Cart
              </button>
              <button className="wishlist-btn" onClick={toggleWishlist}>
                {wishlist ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="product-tabs">
        <div className="tab-headers">
          <button 
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={activeTab === 'specifications' ? 'active' : ''}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviewCount})
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-tab">
              <p>{product.description}</p>
              <h3>Key Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="specifications-tab">
              <table>
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="reviews-summary">
                <div className="average-rating">
                  <div className="rating-number">{product.rating.toFixed(1)}</div>
                  <div className="stars">{renderStars(product.rating)}</div>
                  <div className="total-reviews">{product.reviewCount} reviews</div>
                </div>
              </div>
              <div className="review-list">
                <p>Reviews will be displayed here. This is a mock UI.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="related-products">
        <h2>You May Also Like</h2>
        <div className="related-products-grid">
          {relatedProducts.map(relatedProduct => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 