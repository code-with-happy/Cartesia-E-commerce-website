import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaPercent, FaTags, FaStar } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Shop Smarter, Not Harder</h1>
          <p>CARTESIA brings you the best products from multiple online stores in one place.</p>
          <div className="hero-cta">
            <Link to="/products/electronics" className="btn-primary">Shop Now</Link>
            <Link to="/how-it-works" className="btn-secondary">How It Works</Link>
          </div>
        </div>
      </section>

      <section className="featured-categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          <Link to="/products/electronics" className="category-card">
            <div className="category-icon">🖥️</div>
            <h3>Electronics</h3>
          </Link>
          <Link to="/products/clothing" className="category-card">
            <div className="category-icon">👕</div>
            <h3>Clothing</h3>
          </Link>
          <Link to="/products/books" className="category-card">
            <div className="category-icon">📚</div>
            <h3>Books</h3>
          </Link>
          <Link to="/products/home" className="category-card">
            <div className="category-icon">🏠</div>
            <h3>Home & Decor</h3>
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Shop with CARTESIA?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaShoppingBag className="feature-icon" />
            <h3>Product Aggregation</h3>
            <p>We collect products from multiple stores including Amazon, Flipkart, and Myntra.</p>
          </div>
          <div className="feature-card">
            <FaStar className="feature-icon" />
            <h3>Smart Recommendations</h3>
            <p>Get personalized product suggestions based on your preferences.</p>
          </div>
          <div className="feature-card">
            <FaPercent className="feature-icon" />
            <h3>Dynamic Pricing</h3>
            <p>Find the best deals with real-time price comparisons across stores.</p>
          </div>
          <div className="feature-card">
            <FaTags className="feature-icon" />
            <h3>Advanced Filtering</h3>
            <p>Easily find exactly what you're looking for with our powerful search tools.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 