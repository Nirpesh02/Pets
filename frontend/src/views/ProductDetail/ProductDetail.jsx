import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Calendar,
  AlertCircle,
  Star,
  Check,
  ChevronRight,
  Info,
  PawPrint,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import { formatNPR, formatDate, getExpiryStatus } from '../../utils/formatters';
import { getLifeStageLabel } from '../../utils/constants';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/feedback/Alert';

const RATING_LABELS = {
  1: '1 Star - Needs Improvement ⚠️',
  2: '2 Stars - Fair 😐',
  3: '3 Stars - Good 🙂',
  4: '4 Stars - Great! 🐶',
  5: '5 Stars - Outstanding! 🌟',
};

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();

  // Review states
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newPetInfo, setNewPetInfo] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviews = async (productId) => {
    try {
      setLoadingReviews(true);
      const data = await reviewApi.getProductReviews(productId);
      setReviews(data.reviews || []);
      if (data.distribution) {
        setRatingDistribution(data.distribution);
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const [data] = await Promise.all([
          productApi.getProductById(id),
          loadReviews(id),
        ]);
        if (data) {
          setProduct(data);
          setSelectedImage(data.images?.[0] || '');
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
          // Load related products
          const allProds = await productApi.getProducts({ category: data.category });
          setRelatedProducts(allProds.filter((p) => (p._id || p.id) !== (data._id || data.id)).slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in first to write a review! 🐾');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!newRating || newRating < 1 || newRating > 5) {
      toast.error('Please pick a star rating between 1 and 5');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please write your review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewApi.createReview(id, {
        rating: newRating,
        comment: newComment.trim(),
        petInfo: newPetInfo.trim(),
      });

      toast.success('🎉 Thank you! Your review has been submitted.');
      setShowReviewForm(false);
      setNewComment('');
      setNewPetInfo('');
      setNewRating(5);

      // Refresh reviews & product data so rating recalculates
      await Promise.all([
        loadReviews(id),
        productApi.getProductById(id).then((updatedProd) => {
          if (updatedProd) setProduct(updatedProd);
        }),
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteUserReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Review deleted successfully.');
      await Promise.all([
        loadReviews(id),
        productApi.getProductById(id).then((updatedProd) => {
          if (updatedProd) setProduct(updatedProd);
        }),
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading || !product) {
    return <Loader size="lg" text="Loading product details..." fullScreen={false} />;
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stockCount;
  const expInfo = getExpiryStatus(product.expiryDate);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.warning('Please log in first to add items to your cart! 🐾');
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.warning('Please log in first to buy products! 🐾');
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  return (
    <div className="container product-detail-root">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb">
        <Link to="/">Home</Link> <ChevronRight size={14} />
        <Link to="/shop">Shop</Link> <ChevronRight size={14} />
        <Link to={`/shop?category=${product.category}`}>{product.category}</Link> <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="product-detail-layout">
        {/* Gallery Section */}
        <div className="product-gallery-section">
          <div className="main-image-display">
            <img src={selectedImage || product.images?.[0]} alt={product.name} />
            {product.discountPercent > 0 && (
              <span className="detail-discount-tag">-{product.discountPercent}% OFF</span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="gallery-thumbs-row">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Kathmandu Valley Express Delivery Info Box */}
          <div className="delivery-perks-card">
            <div className="perk-row">
              <Truck size={18} className="text-orange-500" />
              <div>
                <strong>Kathmandu Valley Express:</strong> Same-day delivery inside Ring Road. Rs. 100 flat.
              </div>
            </div>
            <div className="perk-row">
              <ShieldCheck size={18} className="text-emerald-500" />
              <div>
                <strong>100% Genuine Guarantee:</strong> Sourced directly from authorized Nepal importers.
              </div>
            </div>
            <div className="perk-row">
              <RotateCcw size={18} className="text-blue-500" />
              <div>
                <strong>eSewa & Cash on Delivery:</strong> Pay easily on delivery or via mobile wallet.
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="product-info-section">
          <div className="product-header-tags">
            <span className="brand-badge-pill">{product.brand}</span>
            <span className="category-badge-pill">{product.category}</span>
            <span className="pet-badge-pill">{product.petType?.toUpperCase()}</span>
            {product.lifeStage && product.lifeStage !== 'all' && (
              <span className="category-badge-pill" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                🌱 {getLifeStageLabel(product.lifeStage, product.petType)}
              </span>
            )}
            {product.breedSpecific && product.breedSpecific !== 'All Breeds' && (
              <span className="category-badge-pill" style={{ background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' }}>
                🏷️ {product.breedSpecific}
              </span>
            )}
          </div>

          <h1 className="detail-product-title">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="detail-rating-row">
            <a
              href="#customer-reviews"
              className="star-rating"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span className="rating-score">{product.rating || 5.0}</span>
            </a>
            <a
              href="#customer-reviews"
              className="reviews-count"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              ({reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'} in Nepal)
            </a>
            <span className="stock-status-pill in-stock">
              <Check size={13} /> {currentStock > 0 ? `${currentStock} units in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Batch & Expiry Date Highlight Box */}
          <div className="batch-expiry-callout">
            <div className="batch-expiry-left">
              <Calendar size={20} className="text-orange-600" />
              <div>
                <div className="batch-label">
                  Batch No: <code>{product.batchNumber || 'NP-BATCH-VERIFIED'}</code>
                </div>
                <div className="expiry-sub">Expiry: {formatDate(product.expiryDate)}</div>
              </div>
            </div>
            <Badge variant={expInfo.color} size="md">
              {expInfo.label}
            </Badge>
          </div>

          {/* Pricing Row */}
          <div className="detail-price-box">
            <div className="price-main">{formatNPR(currentPrice)}</div>
            {product.originalPrice > currentPrice && (
              <div className="price-original-wrap">
                <span className="price-original">{formatNPR(product.originalPrice)}</span>
                <span className="price-save-text">
                  Save {formatNPR(product.originalPrice - currentPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Weight Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="variants-selector-section">
              <label className="variants-label">Select Package Size / Weight:</label>
              <div className="variants-options-grid">
                {product.variants.map((v, i) => {
                  const isSelected = selectedVariant?.weight === v.weight;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`variant-select-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      <span className="variant-weight-text">{v.weight}</span>
                      <span className="variant-price-text">{formatNPR(v.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dietary Tags */}
          {product.dietaryTags?.length > 0 && (
            <div className="dietary-tags-strip">
              <span className="tags-label">Key Nutrition Highlights:</span>
              <div className="tags-chips-wrap">
                {product.dietaryTags.map((t, idx) => (
                  <span key={idx} className="dietary-chip">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="cta-action-area">
            <div className="quantity-counter">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.min(currentStock || 10, q + 1))}
              >
                +
              </button>
            </div>

            <Button
              variant="secondary"
              size="lg"
              icon={ShoppingCart}
              onClick={handleAddToCart}
              className="flex-1"
            >
              Add to Cart
            </Button>

            <Button
              variant="primary"
              size="lg"
              icon={Zap}
              onClick={handleBuyNow}
              className="flex-1"
            >
              Buy Now
            </Button>
          </div>

          {/* Product Summary */}
          <div className="detail-short-desc">
            <p>{product.shortDesc}</p>
          </div>
        </div>
      </div>

      {/* Feeding Guide & Nutrition Analysis Tabs / Section */}
      <section className="feeding-guide-section">
        <h2 className="guide-main-heading">Nutritional Analysis & Daily Feeding Guide</h2>
        <p className="guide-subtitle">
          Vet recommendations tailored for pet weight and activity levels.
        </p>

        {product.feedingGuide && product.feedingGuide.length > 0 ? (
          <div className="feeding-table-wrapper">
            <table className="feeding-table">
              <thead>
                <tr>
                  <th>Pet Body Weight</th>
                  <th>Normal Daily Activity</th>
                  <th>High Activity / Working Dogs</th>
                </tr>
              </thead>
              <tbody>
                {product.feedingGuide.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{row.petWeight}</strong>
                    </td>
                    <td>{row.normalActivity}</td>
                    <td>{row.highActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="feeding-text-box">
            <p>
              Always provide plenty of fresh drinking water with meals. Adjust portion sizes based on
              your pet's body condition and age.
            </p>
          </div>
        )}

        {product.description && (
          <div className="full-description-text">
            <h3>Detailed Formulation</h3>
            <p>{product.description}</p>
          </div>
        )}
      </section>

      {/* Customer Ratings & Reviews Section */}
      <section id="customer-reviews" className="customer-reviews-section">
        <div className="reviews-header-block">
          <div>
            <div className="reviews-badge-pill">Verified Feedback</div>
            <h2 className="reviews-title">Customer Ratings & Reviews</h2>
            <p className="reviews-subtitle">
              Authentic experiences from verified pet parents feeding and caring for their furry family.
            </p>
          </div>

          {!showReviewForm && (
            <Button
              variant="primary"
              size="md"
              icon={Star}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('Please sign in to write a review for your pet!');
                  navigate('/login', { state: { from: location } });
                  return;
                }
                setShowReviewForm(true);
              }}
            >
              Write a Review
            </Button>
          )}
        </div>

        {/* Rating Overview & Breakdown Grid */}
        <div className="rating-overview-grid">
          {/* Big Score Card */}
          <div className="score-summary-card">
            <div className="score-number">{product.rating || 5.0}</div>
            <div className="score-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(product.rating || 5) ? '#f59e0b' : 'none'}
                  color={s <= Math.round(product.rating || 5) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <div className="score-meta">
              Based on {reviews.length} {reviews.length === 1 ? 'verified review' : 'verified reviews'}
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="rating-bars-card">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = ratingDistribution[starNum] || 0;
              const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={starNum} className="star-bar-row">
                  <div className="bar-label">
                    <span>{starNum}</span>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="bar-count">
                    {count} ({percent}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write a Review Box (Expandable) */}
        {showReviewForm && (
          <div className="write-review-card">
            <div className="write-review-header">
              <h3 className="write-review-title">Share Your Pet's Experience</h3>
              <button
                type="button"
                className="close-review-form-btn"
                onClick={() => setShowReviewForm(false)}
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="review-form">
              {/* Star Rating Picker */}
              <div className="form-group-star">
                <label className="form-label">Overall Rating:</label>
                <div className="interactive-star-picker">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || newRating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        className="star-pick-btn"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(starVal)}
                      >
                        <Star
                          size={30}
                          fill={isFilled ? '#f59e0b' : 'none'}
                          color={isFilled ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    );
                  })}
                  <span className="star-pick-label">
                    {RATING_LABELS[hoverRating || newRating] || 'Tap stars to rate'}
                  </span>
                </div>
              </div>

              {/* Pet Info / Title */}
              <div className="form-group">
                <label className="form-label">Pet Breed or Location (Optional):</label>
                <input
                  type="text"
                  className="review-input"
                  placeholder="e.g. Kathmandu • Golden Retriever Parent or Cat Parent to Luna 🐈"
                  value={newPetInfo}
                  onChange={(e) => setNewPetInfo(e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Review Comment */}
              <div className="form-group">
                <label className="form-label">Your Review & Comments:</label>
                <textarea
                  className="review-textarea"
                  rows={4}
                  placeholder="Tell other pet lovers about food freshness, packaging, how much your pet enjoyed it, delivery speed..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  maxLength={1000}
                />
                <div className="char-count">{newComment.length} / 1000 characters</div>
              </div>

              <div className="form-actions-row">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submittingReview || !newRating || !newComment.trim()}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list-container">
          {loadingReviews ? (
            <Loader size="md" text="Loading customer reviews..." />
          ) : reviews.length === 0 ? (
            <div className="no-reviews-box">
              <PawPrint size={40} className="no-reviews-icon" />
              <h3>No reviews yet for this product</h3>
              <p>Be the first pet parent in Nepal to leave feedback for {product.name}!</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info('Please log in to write a review.');
                    navigate('/login', { state: { from: location } });
                    return;
                  }
                  setShowReviewForm(true);
                }}
              >
                Write the First Review
              </Button>
            </div>
          ) : (
            <div className="reviews-cards-stack">
              {reviews.map((rev) => {
                const revId = rev._id || rev.id;
                const revUserId = rev.user?._id || rev.user?.id || rev.user;
                const currentUserId = user?._id || user?.id;
                const canDelete =
                  (currentUserId && String(revUserId) === String(currentUserId)) ||
                  user?.role === 'admin';

                return (
                  <div key={revId} className="single-review-card">
                    <div className="review-card-header">
                      <div className="review-author-meta">
                        {(rev.user?.avatar || rev.userAvatar) ? (
                          <img
                            src={rev.user?.avatar || rev.userAvatar}
                            alt={rev.user?.name || rev.userName}
                            className="review-avatar"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="review-avatar-placeholder"
                          style={{ display: (rev.user?.avatar || rev.userAvatar) ? 'none' : 'flex' }}
                        >
                          {(rev.user?.name || rev.userName) ? (rev.user?.name || rev.userName).charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div className="review-author-name-row">
                            <strong>{rev.user?.name || rev.userName}</strong>
                            <span className="verified-buyer-badge">
                              <ShieldCheck size={12} /> Verified Pet Parent
                            </span>
                          </div>
                          {rev.petInfo && (
                            <span className="review-pet-info-text">{rev.petInfo}</span>
                          )}
                          <span className="review-date-text">{formatDate(rev.createdAt)}</span>
                        </div>
                      </div>

                      <div className="review-header-right">
                        <div className="review-stars-pill">
                          {'★'.repeat(Math.min(5, Math.max(1, Math.round(rev.rating))))}
                          {'☆'.repeat(5 - Math.min(5, Math.max(1, Math.round(rev.rating))))}
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            className="delete-review-btn"
                            title="Delete this review"
                            onClick={() => handleDeleteUserReview(revId)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="review-card-body">
                      <p>{rev.comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <h2 className="section-main-title">You May Also Like</h2>
          <div className="related-products-grid">
            {relatedProducts.map((p) => {
              const relId = p._id || p.id;
              return (
                <div key={relId} className="product-card">
                  <Link to={`/products/${relId}`} className="product-image-wrap">
                    <img src={p.images?.[0]} alt={p.name} className="product-card-img" />
                  </Link>
                  <div className="product-card-body">
                    <span className="product-brand-tag">{p.brand}</span>
                    <Link to={`/products/${relId}`} className="product-title-link">
                      <h4 className="product-card-title">{p.name}</h4>
                    </Link>
                  <div className="product-price-row">
                    <span className="current-price">{formatNPR(p.price)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.warning('Please log in first to add items to your cart! 🐾');
                          navigate('/login', { state: { from: location } });
                          return;
                        }
                        addToCart(p, 1);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
