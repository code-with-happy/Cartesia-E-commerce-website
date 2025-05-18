import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const {
    id,
    name,
    price,
    originalPrice,
    discount,
    image,
    rating,
    reviewCount,
    store,
  } = product;

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
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

  // Calculate discount percentage
  const discountPercentage = discount ? Math.round(discount * 100) : null;

  return (
    <Link to={`/product/${id}`} className="product-card">
      <div className="product-image-container">
        <img src={image} alt={name} className="product-image" />
        {discountPercentage && (
          <span className="discount-badge">-{discountPercentage}%</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        
        <div className="product-store">{store}</div>
        
        <div className="product-rating">
          <div className="stars">{renderStars(rating)}</div>
          <span className="review-count">({reviewCount})</span>
        </div>
        
        <div className="product-price">
          <span className="current-price">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="original-price">${originalPrice.toFixed(2)}</span>
          )}
        </div>
        
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          aria-label="Add to cart"
        >
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard; 