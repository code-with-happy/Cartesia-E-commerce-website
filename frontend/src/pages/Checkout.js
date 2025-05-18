import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Calculate totals
  const shipping = totalPrice > 50 ? 0 : 4.99;
  const tax = totalPrice * 0.1; // 10% tax
  const grandTotal = totalPrice + shipping + tax;

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate shipping info
  const validateShippingInfo = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment info
  const validatePaymentInfo = () => {
    const newErrors = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number is invalid';
    }

    if (!formData.expDate.trim()) {
      newErrors.expDate = 'Expiration date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expDate)) {
      newErrors.expDate = 'Use format MM/YY';
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      if (validateShippingInfo()) {
        setStep(2);
      }
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(1);
  };

  // Handle order submission
  const handleSubmitOrder = (e) => {
    e.preventDefault();

    if (validatePaymentInfo()) {
      setIsProcessing(true);

      // Simulate order processing
      setTimeout(() => {
        setIsProcessing(false);
        setIsOrderComplete(true);
        setOrderNumber(Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
        clearCart();
      }, 2000);
    }
  };

  // If cart is empty, redirect to cart page
  if (items.length === 0 && !isOrderComplete) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Add items to your cart before proceeding to checkout.</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // Order success screen
  if (isOrderComplete) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h2>Thank You for Your Order!</h2>
          <p>Your order #{orderNumber} has been successfully placed.</p>
          <p>We've sent a confirmation email to {formData.email}.</p>
          <div className="success-actions">
            <Link to="/" className="btn-primary">Continue Shopping</Link>
            <Link to="/orders" className="btn-secondary">View My Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <Link to="/cart" className="back-link">
            <FaArrowLeft /> Back to Cart
          </Link>
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-text">Shipping</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-text">Payment</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-text">Confirmation</div>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            {step === 1 && (
              <div className="shipping-form">
                <h2>Shipping Information</h2>
                <form>
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? 'error' : ''}
                    />
                    {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <div className="error-message">{errors.address}</div>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <div className="error-message">{errors.city}</div>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={errors.state ? 'error' : ''}
                      />
                      {errors.state && <div className="error-message">{errors.state}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="zipCode">ZIP Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={errors.zipCode ? 'error' : ''}
                      />
                      {errors.zipCode && <div className="error-message">{errors.zipCode}</div>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        {/* Add more countries as needed */}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleNextStep}
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="payment-form">
                <h2>Payment Information</h2>
                <form onSubmit={handleSubmitOrder}>
                  <div className="secure-payment">
                    <FaLock /> <span>Secure Payment</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardName">Name on Card</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={errors.cardName ? 'error' : ''}
                    />
                    {errors.cardName && <div className="error-message">{errors.cardName}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expDate">Expiration Date</label>
                      <input
                        type="text"
                        id="expDate"
                        name="expDate"
                        value={formData.expDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={errors.expDate ? 'error' : ''}
                      />
                      {errors.expDate && <div className="error-message">{errors.expDate}</div>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <div className="error-message">{errors.cvv}</div>}
                    </div>
                  </div>

                  <div className="payment-buttons">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handlePrevStep}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 