import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Heart, CheckCircle2 } from 'lucide-react';
import { subscriberApi } from '../../api/subscriberApi';
import { useToast } from '../../context/ToastContext';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleJoinNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Please enter your email address to join.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await subscriberApi.joinExclusiveOffers(newsletterEmail.trim());
      localStorage.setItem('pawnepal_newsletter_email', newsletterEmail.trim());
      window.dispatchEvent(new CustomEvent('newsletter:joined', { detail: { email: newsletterEmail.trim() } }));
      toast.success(res.message || 'Thank you for joining! Request sent to Admin for approval.');
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <footer className="site-footer">
      {/* Value Proposition Highlights */}
      <div className="footer-highlights-bar">
        <div className="container highlights-grid">
          <div className="highlight-item">
            <div className="highlight-icon">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="highlight-title">Valley Same-Day Delivery</h4>
              <p className="highlight-sub">Inside Ring Road delivery within 24h</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="highlight-title">100% Genuine & Fresh Batch</h4>
              <p className="highlight-sub">Transparent expiry dates on all food</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="highlight-title">eSewa & COD Available</h4>
              <p className="highlight-sub">Easy mobile payments or pay upon arrival</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-main-content">
        <div className="footer-cols-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <div className="brand-logo footer-logo">
              <div className="logo-icon-box">
                <PawPrint size={22} className="text-white" />
              </div>
              <span className="brand-name">
                Paw<span className="text-primary">Nepal</span>
              </span>
            </div>
            <p className="footer-about-text">
              Nepal's dedicated destination for vet-approved dog, cat, and bird nutrition,
              grooming, and healthcare. Because your pets deserve only the freshest nourishment.
            </p>
            <div className="footer-contact-list">
              <div className="contact-line">
                <Phone size={15} /> <span>+977 9841234567 / 01-4412345</span>
              </div>
              <div className="contact-line">
                <Mail size={15} /> <span>support@pawnepal.com</span>
              </div>
              <div className="contact-line">
                <MapPin size={15} /> <span>Baluwatar & Jhamsikhel, Kathmandu Valley</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Pet Categories</h4>
            <ul className="footer-links">
              <li><Link to="/shop?petType=dog">Dog Food & Chews</Link></li>
              <li><Link to="/shop?petType=cat">Cat Wet & Dry Food</Link></li>
              <li><Link to="/shop?category=health">Vitamins & Deworming</Link></li>
              <li><Link to="/shop?category=grooming">Anti-Tick Shampoos</Link></li>
              <li><Link to="/shop?category=toys">Chew Toys & Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/dashboard">Track Your Order</Link></li>
              <li><Link to="/pet-profile">Dietary Profile Builder</Link></li>
              <li><Link to="/cart">Cart & Checkout</Link></li>
              <li><Link to="/shop">Kathmandu Valley Rates</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="footer-col">
            <h4 className="footer-heading">Accepted Payments</h4>
            <p className="footer-subtext">Safe digital transactions and instant receipts.</p>
            <div className="payment-badges-row">
              <span className="payment-badge-chip esewa-chip">eSewa Wallet</span>
              <span className="payment-badge-chip khalti-chip">Khalti</span>
              <span className="payment-badge-chip cod-chip">Cash on Delivery</span>
            </div>

            <div className="newsletter-box">
              <span className="newsletter-label">Pet Health Tips & Exclusive Offers</span>
              <form onSubmit={handleJoinNewsletter} className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button type="submit" className="newsletter-btn" disabled={submitting}>
                  {submitting ? '...' : 'Join'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} PawNepal. Crafted with <Heart size={14} className="text-red inline-icon" /> for pet parents across Nepal.</p>
          <div className="bottom-meta-links">
            <span>Kathmandu</span> • <span>Lalitpur</span> • <span>Bhaktapur</span> • <span>Pokhara</span> • <span>Chitwan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
