import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
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
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { activePet } = usePet();
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [bannersData, prodsData] = await Promise.all([
          adminApi.getBanners(),
          productApi.getFeaturedProducts(),
        ]);
        const activeBanners = bannersData.filter((b) => b.active);
        setBanners(activeBanners.length > 0 ? activeBanners : bannersData);
        setFeaturedProducts(prodsData);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Auto rotate banner every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[activeBannerIndex];

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
              <div className="hero-badge-tag">{currentBanner.badge}</div>
              <h1 className="hero-heading">{currentBanner.title}</h1>
              <p className="hero-subtext">{currentBanner.subtitle}</p>

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

              {/* Banner indicators */}
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
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "Ordering Royal Canin for my Golden Retriever in Baluwatar used to take 2-3 days.
              PawNepal delivered it within 4 hours, and the expiry was 18 months away! Highly recommended."
            </p>
            <div className="testimonial-author">
              <strong>Sujan Bajracharya</strong>
              <span>Kathmandu • Dog Parent to Bruno 🐕</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "The personalized pet diet feature helped me find hypoallergenic cat food for my Persian cat Luna.
              eSewa payment was seamless and hassle-free."
            </p>
            <div className="testimonial-author">
              <strong>Shradha Adhikari</strong>
              <span>Jhamsikhel, Lalitpur • Cat Parent to Luna 🐈</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "Shipped all the way to Pokhara Lakeside in 2 days. The herbal tick shampoo and dental bones
              arrived in perfect bubble wrapping with a tax invoice."
            </p>
            <div className="testimonial-author">
              <strong>Prashant Gurung</strong>
              <span>Pokhara • Dog Parent to Rocky 🐕</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
