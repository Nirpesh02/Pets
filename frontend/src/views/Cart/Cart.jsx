import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  Truck,
  ShieldCheck,
  ChevronLeft,
  PawPrint,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { usePet } from '../../hooks/usePet';
import { formatNPR } from '../../utils/formatters';
import { DELIVERY_ZONES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingFee,
    shippingZoneId,
    setShippingZoneId,
    activeZone,
    promoCode,
    discountAmount,
    discountPercent,
    applyPromoCode,
    removePromoCode,
    finalTotal,
  } = useCart();

  const { activePet } = usePet();
  const [promoInput, setPromoInput] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput.trim());
      setPromoInput('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Treat your furry companion to healthy nutrition, delicious chews, and grooming essentials.</p>
          <Link to="/shop">
            <Button variant="primary" size="lg" icon={ShoppingBag}>
              Explore Pet Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page-root">
      <div className="cart-header-row">
        <div>
          <h1 className="cart-main-title">Shopping Cart</h1>
          <p className="cart-subtitle">Review items and prepare doorstep delivery to your address</p>
        </div>

        <button type="button" className="clear-cart-text-btn" onClick={clearCart}>
          Clear All Items
        </button>
      </div>

      <div className="cart-layout-grid">
        {/* Cart Items List */}
        <div className="cart-items-column">
          {activePet && (
            <div className="cart-pet-notice">
              <PawPrint size={16} className="text-orange-500" />
              <span>
                Ordering for <strong>{activePet.name}</strong> ({activePet.species === 'cat' ? 'Cat 🐈' : 'Dog 🐕'}, {activePet.breed})
              </span>
            </div>
          )}

          <div className="cart-items-card">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-img" />

                <div className="cart-item-details">
                  <Link to={`/products/${item.productId}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <div className="cart-item-variant">Size/Weight: {item.variant}</div>
                  <div className="cart-item-unit-price">{formatNPR(item.price)} each</div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-counter sm">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-line-total">
                    {formatNPR(item.price * item.quantity)}
                  </div>

                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="continue-shopping-wrap">
            <Link to="/shop" className="continue-shopping-link">
              <ChevronLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="cart-summary-column">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>

            {/* Delivery Location Picker */}
            <div className="delivery-location-select-box">
              <label className="input-label">Select Delivery Location:</label>
              <select
                value={shippingZoneId}
                onChange={(e) => setShippingZoneId(e.target.value)}
                className="app-input"
              >
                {DELIVERY_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} (+{formatNPR(zone.cost)})
                  </option>
                ))}
              </select>
              <span className="delivery-estimate-hint">
                <Truck size={13} className="inline-icon" /> Estimated arrival: {activeZone.estimatedDays}
              </span>
            </div>

            {/* Promo Code Box */}
            <div className="promo-code-section">
              {promoCode ? (
                <div className="applied-promo-chip">
                  <div className="promo-text">
                    <Tag size={15} />
                    <span>
                      Coupon: <strong>{promoCode}</strong> (-{discountPercent}%)
                    </span>
                  </div>
                  <button type="button" onClick={removePromoCode} className="remove-promo-btn">
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="promo-form">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. PETLOVER10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="promo-input"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="summary-calculations">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatNPR(subtotal)}</span>
              </div>

              <div className="summary-line">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-green">FREE (Valley Offer)</strong>
                  ) : (
                    formatNPR(shippingFee)
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-line text-green">
                  <span>Discount</span>
                  <span>-{formatNPR(discountAmount)}</span>
                </div>
              )}

              <div className="summary-line grand-total-line">
                <span>Total Amount</span>
                <span>{formatNPR(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/checkout')}
              className="mt-4"
            >
              Proceed to Checkout
            </Button>

            <div className="safe-checkout-badge">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Safe payments via eSewa, Khalti & Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
