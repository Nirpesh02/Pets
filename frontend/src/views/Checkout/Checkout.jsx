import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  User,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Wallet,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { orderApi } from '../../api/orderApi';
import { DELIVERY_ZONES, PAYMENT_METHODS } from '../../utils/constants';
import { formatNPR } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const Checkout = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    shippingZoneId,
    setShippingZoneId,
    activeZone,
    discountAmount,
    promoCode,
    couponExpiresAt,
    removePromoCode,
    finalTotal,
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const { activePet } = usePet();
  const navigate = useNavigate();
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || 'Kathmandu',
    landmark: '',
    instructions: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isEsewaModalOpen, setIsEsewaModalOpen] = useState(false);
  const [esewaId, setEsewaId] = useState('9841234567');
  const [esewaMpin, setEsewaMpin] = useState('1234');

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <div className="container empty-cart-container">
        <div className="empty-cart-card">
          <h2>No items to checkout</h2>
          <p>Please add products to your cart before proceeding.</p>
          <Link to="/shop">
            <Button variant="primary">Return to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();

    // Verify coupon expiration before placing order
    if (promoCode && couponExpiresAt && Date.now() >= new Date(couponExpiresAt).getTime()) {
      removePromoCode();
      toast.error(`⚠️ Coupon "${promoCode}" has expired and cannot be applied to this order.`);
      setSubmitting(false);
      return;
    }

    if (paymentMethod === 'esewa' && !isEsewaModalOpen && !placedOrder) {
      // Trigger interactive eSewa payment flow simulation
      setIsEsewaModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        userId: user?.id || 'guest',
        customerName: shippingAddress.fullName,
        customerPhone: shippingAddress.phone,
        customerEmail: user?.email || '',
        items: cartItems,
        petId: activePet?.id || null,
        petName: activePet ? `${activePet.name} (${activePet.species === 'cat' ? '🐈' : '🐕'})` : null,
        subtotal,
        shippingFee,
        discount: discountAmount,
        promoCode: promoCode || null,
        totalAmount: finalTotal,
        paymentMethod,
        deliveryZone: activeZone.name,
        shippingAddress,
      };

      const result = await orderApi.createOrder(orderPayload);
      clearCart();
      setPlacedOrder(result);
      setIsEsewaModalOpen(false);
      toast.success('Your order has been placed successfully! 🐾');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not complete order. Please try again.';
      toast.error(errMsg);
      if (errMsg.toLowerCase().includes('expired')) {
        removePromoCode();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container checkout-page-root">
      {placedOrder ? (
        /* Order Confirmation View */
        <div className="order-success-card">
          <div className="success-icon-badge">
            <CheckCircle2 size={54} className="text-emerald-500" />
          </div>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">
            Order Reference: <strong>#{placedOrder.id}</strong>
          </p>

          <div className="success-info-box">
            <div className="success-info-row">
              <span>Estimated Delivery:</span>
              <strong>{activeZone.estimatedDays}</strong>
            </div>
            <div className="success-info-row">
              <span>Payment Mode:</span>
              <strong>{placedOrder.paymentMethod.toUpperCase()} ({placedOrder.paymentStatus})</strong>
            </div>
            <div className="success-info-row">
              <span>Total Paid / Payable:</span>
              <strong className="text-primary">{formatNPR(placedOrder.totalAmount)}</strong>
            </div>
            <div className="success-info-row">
              <span>Delivery Address:</span>
              <span>{placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city}</span>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/dashboard">
              <Button variant="primary" size="lg">
                Track Order on Dashboard
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form */
        <>
          <div className="checkout-header">
            <Link to="/cart" className="back-breadcrumb-link">
              <ArrowLeft size={16} /> Back to Cart
            </Link>
            <h1 className="checkout-title">Express Secure Checkout</h1>
            <p className="checkout-subtitle">Doorstep delivery across Kathmandu Valley and Nepal</p>
          </div>

          <form onSubmit={handlePlaceOrder} className="checkout-grid-layout">
            {/* Left Column: Delivery Address & Payment */}
            <div className="checkout-main-column">
              {/* Delivery Zone Selector */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <MapPin size={20} className="text-orange-500" /> Delivery Region
                </h3>
                <div className="zones-radio-grid">
                  {DELIVERY_ZONES.map((zone) => (
                    <label
                      key={zone.id}
                      className={`zone-radio-card ${shippingZoneId === zone.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shippingZone"
                        checked={shippingZoneId === zone.id}
                        onChange={() => setShippingZoneId(zone.id)}
                      />
                      <div className="zone-radio-info">
                        <div className="zone-radio-name">{zone.name}</div>
                        <div className="zone-radio-desc">
                          {zone.estimatedDays} • Fee: {formatNPR(zone.cost)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <User size={20} className="text-orange-500" /> Recipient & Delivery Address
                </h3>

                <div className="form-grid-2">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Mobile Number (+977)"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    required
                    prefixIcon={Phone}
                  />
                </div>

                <div className="form-grid-2">
                  <Input
                    label="City / Municipality"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Famous Nearby Landmark"
                    name="landmark"
                    value={shippingAddress.landmark}
                    onChange={handleInputChange}
                    placeholder="e.g. Near Bhatbhateni, Baluwatar Chowk"
                  />
                </div>

                <Input
                  label="Detailed Street Address / Ward / House No"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  label="Special Delivery Instructions (Optional)"
                  name="instructions"
                  value={shippingAddress.instructions}
                  onChange={handleInputChange}
                  placeholder="e.g. Call upon arriving at the gate, guard available..."
                />
              </div>

              {/* Payment Methods */}
              <div className="checkout-section-card">
                <h3 className="section-card-title">
                  <Wallet size={20} className="text-orange-500" /> Payment Option
                </h3>

                <div className="payment-options-list">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`payment-option-item ${paymentMethod === method.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-item-content">
                        <div className="payment-item-header">
                          <span className="payment-name">{method.name}</span>
                          <span className="payment-badge">{method.badge}</span>
                        </div>
                        <p className="payment-desc">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Review */}
            <div className="checkout-side-column">
              <div className="checkout-summary-box">
                <h3 className="summary-title">Review Order Items</h3>

                <div className="checkout-items-mini-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item-mini">
                      <img src={item.image} alt={item.name} className="checkout-thumb" />
                      <div className="checkout-item-details">
                        <div className="checkout-name">{item.name}</div>
                        <div className="checkout-meta">
                          {item.variant} × {item.quantity}
                        </div>
                      </div>
                      <div className="checkout-price">
                        {formatNPR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {activePet && (
                  <div className="recipient-pet-tag">
                    🐾 Dedicated recipient: <strong>{activePet.name}</strong>
                  </div>
                )}

                <hr className="summary-divider" />

                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{formatNPR(subtotal)}</span>
                </div>
                <div className="summary-line">
                  <span>Delivery ({activeZone.name.split('(')[0]})</span>
                  <span>{shippingFee === 0 ? 'FREE' : formatNPR(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-line text-green">
                    <span>Discount ({promoCode})</span>
                    <span>-{formatNPR(discountAmount)}</span>
                  </div>
                )}
                <div className="summary-line grand-total-line">
                  <span>Payable Total</span>
                  <span>{formatNPR(finalTotal)}</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={submitting}
                  className="mt-4"
                >
                  {paymentMethod === 'esewa' ? 'Pay via eSewa' : 'Confirm Order (COD)'}
                </Button>

                <div className="checkout-guarantee-note">
                  <Lock size={14} /> 256-Bit SSL Encrypted Checkout
                </div>
              </div>
            </div>
          </form>

          {/* eSewa Interactive Payment Simulation Modal */}
          <Modal
            isOpen={isEsewaModalOpen}
            onClose={() => setIsEsewaModalOpen(false)}
            title="eSewa Digital Wallet Payment"
            subtitle={`Payable Amount: ${formatNPR(finalTotal)} to Merchant "PawNepal"`}
            size="sm"
          >
            <div className="esewa-modal-content">
              <div className="esewa-brand-banner">
                <span className="esewa-logo-text">eSewa</span>
                <span className="esewa-nepal-flag">🇳🇵 Nepal's Pioneer Wallet</span>
              </div>

              <div className="esewa-form-fields">
                <Input
                  label="eSewa ID / Mobile Number"
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  placeholder="98XXXXXXXX"
                  required
                />
                <Input
                  label="eSewa 4-Digit MPIN / Password"
                  type="password"
                  value={esewaMpin}
                  onChange={(e) => setEsewaMpin(e.target.value)}
                  placeholder="••••"
                  required
                />
              </div>

              <div className="esewa-modal-actions mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEsewaModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  isLoading={submitting}
                  onClick={handlePlaceOrder}
                >
                  Confirm & Pay {formatNPR(finalTotal)}
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Checkout;
