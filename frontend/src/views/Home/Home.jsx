import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PawPrint,
  ChevronRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Heart,
  ShoppingCart,
  Calendar,
  Clock,
  Tag,
  Check,
  Zap,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import { reviewApi } from '../../api/reviewApi';
import { CATEGORIES, PET_TYPES } from '../../utils/constants';
import { formatNPR, getExpiryStatus } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { usePet } from '../../hooks/usePet';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

export const Home = () => {
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const hasRefreshedExpiredRef = useRef(false);

  const { addToCart } = useCart();
  const { activePet } = usePet();
  const navigate = useNavigate();

  const loadBanners = useCallback(async () => {
    try {
      const bannersData = await adminApi.getBanners();
      const activeBanners = bannersData.filter((b) => b.active);
      setBanners(activeBanners.length > 0 ? activeBanners : bannersData);
      setActiveBannerIndex(0);
    } catch (err) {
      console.warn('Failed to load banners:', err);
    }
  }, []);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const [bannersData, prodsData, reviewsData] = await Promise.all([
        adminApi.getBanners(),
        productApi.getFeaturedProducts(),
        reviewApi.getFeaturedReviews(),
      ]);
      const activeBanners = bannersData.filter((b) => b.active);
      setBanners(activeBanners.length > 0 ? activeBanners : bannersData);
      setFeaturedProducts(prodsData);
      setFeaturedReviews(reviewsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Live second-by-second ticker for exclusive countdown & auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic background check every 5s and on window focus to keep banners & countdown live
  useEffect(() => {
    const periodicPoll = setInterval(() => {
      loadBanners();
    }, 5000);

    const handleFocus = () => {
      loadBanners();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(periodicPoll);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadBanners]);

  // Auto rotate standard banner every 5.5s (only when there are multiple banners)
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[activeBannerIndex];

  // Auto-expire detection: When exclusive banner timer reaches 0, immediately re-fetch to restore standard banners!
  useEffect(() => {
    if (currentBanner?.isExclusive && currentBanner?.expiresAt) {
      const expMs = new Date(currentBanner.expiresAt).getTime();
      const diff = expMs - currentTime;

      if (diff <= 0) {
        if (!hasRefreshedExpiredRef.current) {
          hasRefreshedExpiredRef.current = true;
          // Trigger immediate reload to switch back to normal banners
          loadBanners().then(() => {
            setTimeout(() => {
              hasRefreshedExpiredRef.current = false;
            }, 3000);
          });
        }
      } else {
        hasRefreshedExpiredRef.current = false;
      }
    }
  }, [currentTime, currentBanner, loadBanners]);

  // Format remaining time for countdown badge
  const getRemainingTimeString = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - currentTime;
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${hours}h ${pad(mins)}m ${pad(secs)}s`;
    }
    return `${pad(mins)}m ${pad(secs)}s`;
  };

  const handleCopyCouponCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="home-page-root">
      {/* Hero Banner Section */}
      {currentBanner && (
        <section className="hero-banner-section">
          <div
            className="hero-slide-card"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url(${currentBanner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="container hero-content-wrapper">
              {/* Exclusive Flash Offer Live Countdown Banner Tag */}
              {currentBanner.isExclusive && currentBanner.expiresAt ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.45)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Zap size={16} style={{ color: '#fef08a' }} />
                  <span>LIMITED-TIME FLASH DEAL:</span>
                  <span
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                      letterSpacing: '1px',
                      color: '#fef08a',
                    }}
                  >
                    ⏱️ {getRemainingTimeString(currentBanner.expiresAt)}
                  </span>
                </div>
              ) : (
                <div className="hero-badge-tag">{currentBanner.badge}</div>
              )}

              <h1 className="hero-heading">{currentBanner.title}</h1>
              <p className="hero-subtext">{currentBanner.subtitle}</p>

              {/* Exclusive Voucher Code Copy Pill */}
              {currentBanner.couponCode && (
                <div style={{ marginBottom: '22px' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyCouponCode(currentBanner.couponCode)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      color: '#ffffff',
                      border: '1.5px dashed rgba(255, 255, 255, 0.7)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      transition: 'all 0.2s ease',
                    }}
                    title="Click to copy coupon code to clipboard"
                  >
                    <Tag size={16} style={{ color: '#fef08a' }} />
                    <span>Coupon Voucher:</span>
                    <strong
                      style={{
                        color: '#fef08a',
                        fontFamily: 'monospace',
                        fontSize: '1.05rem',
                        letterSpacing: '1px',
                      }}
                    >
                      {currentBanner.couponCode}
                    </strong>
                    <span
                      style={{
                        background: copiedCoupon ? '#10b981' : 'rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedCoupon ? (
                        <>
                          <Check size={12} /> Copied!
                        </>
                      ) : (
                        'Tap to Copy'
                      )}
                    </span>
                  </button>
                </div>
              )}

              <div className="hero-cta-group">
                <Link to={currentBanner.ctaLink || '/shop'}>
                  <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                    {currentBanner.ctaText || 'Shop Now'}
                  </Button>
                </Link>
                <Link to="/pet-profile">
                  <Button variant="secondary" size="lg" icon={PawPrint}>
                    Build Pet Diet Profile
                  </Button>
                </Link>
              </div>

              {/* Banner indicators (only when multiple banners exist) */}
              {banners.length > 1 && (
                <div className="banner-indicators-row">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`banner-indicator-dot ${idx === activeBannerIndex ? 'active' : ''}`}
                      onClick={() => setActiveBannerIndex(idx)}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Active Pet Personalized Nutrition Strip */}
      {activePet && (
        <section className="active-pet-callout-strip">
          <div className="container active-pet-strip-inner">
            <div className="active-pet-strip-left">
              <img src={activePet.avatar} alt={activePet.name} className="strip-pet-avatar" />
              <div>
                <span className="strip-pet-tag">Personalized For Your Pet</span>
                <h3 className="strip-pet-title">
                  Curated for {activePet.name} ({activePet.breed}, {activePet.ageYears} yrs)
                </h3>
                <p className="strip-pet-sub">
                  Dietary match: <strong>{activePet.dietaryPreference || 'Standard nutrition'}</strong> • Allergy safe
                </p>
              </div>
            </div>

            <Link to={`/shop?petType=${activePet.species}`}>
              <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="right">
                View Food For {activePet.name}
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Pet Species Categories Quick Selector */}
      <section className="container pet-species-section">
        <div className="species-chips-row">
          {PET_TYPES.map((pt) => (
            <button
              key={pt.id}
              type="button"
              className="species-pill-button"
              onClick={() => navigate(pt.id === 'all' ? '/shop' : `/shop?petType=${pt.id}`)}
            >
              <span className="species-pill-icon">{pt.icon}</span>
              <span className="species-pill-text">{pt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Categories Grid */}
      <section className="container section-spacing">
        <div className="section-title-header">
          <div>
            <h2 className="section-main-title">Shop by Category</h2>
            <p className="section-subtitle">Vet-formulated diets, stimulating chews, and grooming essentials</p>
          </div>
          <Link to="/shop" className="view-more-link">
            See All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-cards-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="category-feature-card"
            >
              <div className="cat-card-icon">{cat.icon}</div>
              <h3 className="cat-card-name">{cat.label}</h3>
              <span className="cat-card-count">{cat.count}+ Products Available</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured & Bestsellers Products Showcase */}
      <section className="container section-spacing">
        <div className="section-title-header">
          <div>
            <h2 className="section-main-title">Bestselling Pet Nutrition & Supplies</h2>
            <p className="section-subtitle">
              High-demand food batches with guaranteed freshness and same-day delivery inside Kathmandu Valley
            </p>
          </div>
          <Link to="/shop" className="view-more-link">
            Explore Shop <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <Loader size="md" text="Loading top products..." />
        ) : (
          <div className="products-showcase-grid">
            {featuredProducts.map((prod) => {
              const exp = getExpiryStatus(prod.expiryDate);
              const prodId = prod._id || prod.id;
              return (
                <div key={prodId} className="product-card">
                  {/* Top Badges */}
                  <div className="product-card-top-badges">
                    {prod.discountPercent > 0 && (
                      <span className="discount-tag">-{prod.discountPercent}%</span>
                    )}
                    {prod.expiryDate && (
                      <Badge variant={exp.color} size="sm">
                        {exp.label}
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <Link to={`/products/${prodId}`} className="product-image-wrap">
                    <img
                      src={prod.images?.[0]}
                      alt={prod.name}
                      className="product-card-img"
                      loading="lazy"
                    />
                  </Link>

                  {/* Card Body */}
                  <div className="product-card-body">
                    <div className="product-brand-tag">{prod.brand}</div>
                    <Link to={`/products/${prodId}`} className="product-title-link">
                      <h3 className="product-card-title">{prod.name}</h3>
                    </Link>

                    {prod.batchNumber && (
                      <div className="batch-micro-info">
                        Batch: <code>{prod.batchNumber}</code>
                      </div>
                    )}

                    {/* Weight variant options */}
                    {prod.variants?.length > 1 && (
                      <div className="variants-chips-row">
                        {prod.variants.map((v, idx) => (
                          <span key={idx} className="variant-mini-pill">
                            {v.weight}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="product-price-row">
                      <div>
                        <span className="current-price">{formatNPR(prod.price)}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="original-price">{formatNPR(prod.originalPrice)}</span>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        icon={ShoppingCart}
                        onClick={() => addToCart(prod, 1)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Fresh Batch & Valley Delivery Quality Promise */}
      <section className="quality-promise-banner">
        <div className="container promise-inner">
          <div className="promise-col">
            <div className="promise-icon-circle">
              <Calendar size={28} />
            </div>
            <h3>Transparent Expiry Guarantee</h3>
            <p>
              We inspect every shipment. All products clearly state their manufacturing batch number and
              expiration date before you purchase.
            </p>
          </div>

          <div className="promise-col">
            <div className="promise-icon-circle">
              <Truck size={28} />
            </div>
            <h3>Valley Same-Day Dispatch</h3>
            <p>
              Order before 1:00 PM for same-day doorstep arrival in Kathmandu, Patan, and Lalitpur.
              Reliable courier delivery across all 7 provinces.
            </p>
          </div>

          <div className="promise-col">
            <div className="promise-icon-circle">
              <ShieldCheck size={28} />
            </div>
            <h3>Vet-Approved Nutrition</h3>
            <p>
              Formulated specifically for dogs and cats in Himalayan and subtropical climates,
              ensuring dense coat care, strong joints, and digestive ease.
            </p>
          </div>
        </div>
      </section>

      {/* Nepal Pet Parents Testimonials */}
      <section className="container section-spacing">
        <div className="section-title-header text-center">
          <div>
            <h2 className="section-main-title">Loved by 4,000+ Pet Parents in Nepal</h2>
            <p className="section-subtitle">Real experiences from pet lovers across Kathmandu and beyond</p>
          </div>
        </div>

        <div className="testimonials-grid">
          {featuredReviews && featuredReviews.length > 0 ? (
            featuredReviews.map((rev) => {
              const starsCount = Math.min(5, Math.max(1, Math.round(rev.rating || 5)));
              return (
                <div key={rev._id || rev.id} className="testimonial-card">
                  <div className="testimonial-stars">
                    {'★'.repeat(starsCount)}
                    {'☆'.repeat(5 - starsCount)}
                  </div>
                  <p className="testimonial-text">
                    "{rev.comment}"
                  </p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #fdba74',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#ffedd5',
                            color: '#ea580c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                          }}
                        >
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'P'}
                        </div>
                      )}
                      <div>
                        <strong>{rev.userName}</strong>
                        <span style={{ display: 'block', fontSize: '0.82rem', color: '#64748b' }}>
                          {rev.petInfo || (rev.product?.name ? `Purchased: ${rev.product.name}` : 'Verified Pet Parent in Nepal 🐾')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '42px 20px',
                background: 'rgba(255, 247, 237, 0.7)',
                borderRadius: '16px',
                border: '1.5px dashed #fed7aa',
              }}
            >
              <PawPrint size={36} style={{ color: '#ea580c', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Authentic Pet Parent Reviews
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 16px' }}>
                Real experiences from pet owners will appear here once selected by our admin team. Check out our products to leave your feedback!
              </p>
              <Link to="/shop">
                <Button variant="outline" size="sm">Explore Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
