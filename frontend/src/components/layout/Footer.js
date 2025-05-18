import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>CARTESIA</h3>
          <p className="footer-tagline">All stores. One Cart.</p>
          <p className="footer-description">
            We simplify your online shopping experience by aggregating products from multiple
            stores into one seamless platform.
          </p>
        </div>

        <div className="footer-section">
          <h3>Shop</h3>
          <ul className="footer-links">
            <li><Link to="/products/electronics">Electronics</Link></li>
            <li><Link to="/products/clothing">Clothing</Link></li>
            <li><Link to="/products/books">Books</Link></li>
            <li><Link to="/products/home">Home & Decor</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul className="footer-links">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Shipping Information</Link></li>
            <li><Link to="/returns">Returns & Refunds</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
          <div className="newsletter">
            <h4>Subscribe to our newsletter</h4>
            <form>
              <input 
                type="email" 
                placeholder="Your email address" 
                required 
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} CARTESIA. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/about">About Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 