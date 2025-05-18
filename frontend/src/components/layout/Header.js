import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <Link to="/" className="logo">
            <div className="fancy-title">
              <span>C</span><span>A</span><span>R</span><span>T</span>
              <span>E</span><span>S</span><span>I</span><span>A</span>
            </div>
          </Link>
          <div className="slogan">All stores. One Cart.</div>
        </div>

        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="mobile-toggle" onClick={toggleMobileMenu}>
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
          <div className="category-links">
            <Link to="/products/electronics">Electronics</Link>
            <Link to="/products/clothing">Clothing</Link>
            <Link to="/products/books">Books</Link>
            <Link to="/products/home">Home & Decor</Link>
          </div>
          <div className="user-links">
            <Link to="/cart" className="cart-link">
              <FaShoppingCart />
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
            {isAuthenticated ? (
              <div className="user-dropdown">
                <button className="user-button">
                  <FaUser />
                  <span>{user?.name || 'Account'}</span>
                </button>
                <div className="dropdown-content">
                  <Link to="/profile">My Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <button onClick={logout} className="logout-button">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="login-link">
                <FaUser />
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 