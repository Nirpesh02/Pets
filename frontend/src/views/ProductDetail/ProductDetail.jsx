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
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { formatNPR, formatDate, getExpiryStatus } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/feedback/Alert';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const data = await productApi.getProductById(id);
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
          </div>

          <h1 className="detail-product-title">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="detail-rating-row">
            <div className="star-rating">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span className="rating-score">{product.rating || 4.8}</span>
            </div>
            <span className="reviews-count">({product.reviewCount || 24} customer reviews in Nepal)</span>
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
