import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  EyeOff,
  PawPrint,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { reviewApi } from '../../../api/reviewApi';
import { formatDate } from '../../../utils/formatters';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';
import { Link } from 'react-router-dom';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    featuredCount: 0,
    fiveStarCount: 0,
    avgRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, featured, not_featured
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  const toast = useToast();

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (ratingFilter !== 'all') params.rating = ratingFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await reviewApi.getAdminReviews(params);
      setReviews(data.reviews || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error('Failed to load reviews from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter, ratingFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadReviews();
  };

  const handleToggleFeatured = async (review) => {
    const revId = review._id || review.id;
    const willBeFeatured = !review.isFeaturedOnHome;
    setActionLoadingId(revId);

    try {
      const res = await reviewApi.toggleFeaturedReview(revId, willBeFeatured);

      // Update state locally
      setReviews((prev) =>
        prev.map((r) =>
          (r._id || r.id) === revId ? { ...r, isFeaturedOnHome: willBeFeatured } : r
        )
      );

      setStats((prev) => ({
        ...prev,
        featuredCount: willBeFeatured
          ? prev.featuredCount + 1
          : Math.max(0, prev.featuredCount - 1),
      }));

      if (willBeFeatured) {
        toast.success(
          `🌟 Review by "${review.userName}" is now LIVE on the client-side homepage under "Loved by 4,000+ Pet Parents in Nepal"!`
        );
      } else {
        toast.info(`Review by "${review.userName}" removed from the storefront homepage.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteReview = async (review) => {
    const revId = review._id || review.id;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the review by "${review.userName}"?`
      )
    ) {
      return;
    }

    try {
      await reviewApi.deleteReview(revId);
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== revId));
      setStats((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
        featuredCount: review.isFeaturedOnHome
          ? Math.max(0, prev.featuredCount - 1)
          : prev.featuredCount,
      }));
      toast.success('Review permanently deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="admin-page-title" style={{ margin: 0 }}>Client Reviews & Ratings</h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#ffedd5',
                color: '#c2410c',
                padding: '3px 10px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              Moderation & Showcase
            </span>
          </div>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Manage client reviews submitted on products. Click <strong>"Add to Client Side"</strong> to
            feature genuine testimonials on the public homepage!
          </p>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#1e293b',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s',
          }}
        >
          <ExternalLink size={15} />
          <span>View Public Store</span>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Reviews</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {stats.totalReviews}
            </div>
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1.5px solid #fde68a',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>
              Live on Client Side
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#78350f' }}>
              {stats.featuredCount}
            </div>
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={22} fill="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>5-Star Reviews</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {stats.fiveStarCount}
            </div>
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {stats.avgRating} / 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="admin-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '280px' }}
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by client name, email, product, comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Client Side:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Reviews</option>
              <option value="featured">⭐ Live on Client Side</option>
              <option value="not_featured">Not Featured</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table / Card List */}
      {loading ? (
        <Loader size="lg" text="Loading client reviews..." />
      ) : reviews.length === 0 ? (
        <div
          className="admin-card"
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <PawPrint size={44} style={{ margin: '0 auto 12px', color: '#ea580c', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            No Reviews Found
          </h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 16px', fontSize: '0.9rem' }}>
            {searchQuery || statusFilter !== 'all' || ratingFilter !== 'all'
              ? 'No reviews match your filter criteria. Try resetting the filters.'
              : 'When clients review products on the store, their feedback and ratings will show up here.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || ratingFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRatingFilter('all');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Client / Reviewer</th>
                  <th style={{ minWidth: '200px' }}>Product</th>
                  <th style={{ minWidth: '120px' }}>Rating</th>
                  <th style={{ minWidth: '300px' }}>Client Review & Pet Info</th>
                  <th style={{ minWidth: '160px' }}>Client Side Status</th>
                  <th style={{ minWidth: '200px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => {
                  const revId = rev._id || rev.id;
                  const isFeatured = rev.isFeaturedOnHome;
                  const starsCount = Math.min(5, Math.max(1, Math.round(rev.rating || 5)));
                  const isLoadingAction = actionLoadingId === revId;

                  return (
                    <tr
                      key={revId}
                      style={{
                        backgroundColor: isFeatured ? 'rgba(255, 247, 237, 0.45)' : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {/* Reviewer Details */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {rev.userAvatar ? (
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #fed7aa',
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
                                fontSize: '0.9rem',
                              }}
                            >
                              {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                              {rev.userName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {rev.user?.email || 'Registered Customer'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                              {formatDate(rev.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Product Details */}
                      <td>
                        {rev.product ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {rev.product.images?.[0] && (
                              <img
                                src={rev.product.images[0]}
                                alt={rev.product.name}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  border: '1px solid #e2e8f0',
                                }}
                              />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <Link
                                to={`/products/${rev.product._id || rev.product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  color: '#0369a1',
                                  textDecoration: 'none',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                                title={rev.product.name}
                              >
                                {rev.product.name}
                              </Link>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {rev.product.brand}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            Product Unavailable
                          </span>
                        )}
                      </td>

                      {/* Rating Score */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#f59e0b', fontSize: '0.9rem', letterSpacing: '1px' }}>
                            {'★'.repeat(starsCount)}
                            <span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - starsCount)}</span>
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#475569',
                            display: 'block',
                            marginTop: '2px',
                          }}
                        >
                          {rev.rating}.0 / 5.0
                        </span>
                      </td>

                      {/* Review Comment & Pet Info */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.88rem',
                            color: '#1e293b',
                            lineHeight: 1.45,
                            background: '#f8fafc',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            marginBottom: rev.petInfo ? '6px' : '0',
                          }}
                        >
                          "{rev.comment}"
                        </div>
                        {rev.petInfo && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.76rem',
                              color: '#ea580c',
                              fontWeight: 600,
                              background: '#fff7ed',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            <PawPrint size={11} />
                            <span>{rev.petInfo}</span>
                          </div>
                        )}
                      </td>

                      {/* Client Side Status Pill */}
                      <td>
                        {isFeatured ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            <Sparkles size={12} style={{ color: '#f59e0b' }} />
                            <span>Live on Homepage</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            Not Featured
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          {/* Add to client side / Remove button */}
                          <button
                            type="button"
                            disabled={isLoadingAction}
                            onClick={() => handleToggleFeatured(rev)}
                            title={
                              isFeatured
                                ? 'Remove from client-side homepage'
                                : 'Add to client-side homepage (Loved by 4,000+ Pet Parents)'
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: isLoadingAction ? 'not-allowed' : 'pointer',
                              border: isFeatured ? '1.5px solid #cbd5e1' : 'none',
                              background: isFeatured
                                ? '#ffffff'
                                : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                              color: isFeatured ? '#475569' : '#ffffff',
                              boxShadow: isFeatured
                                ? 'none'
                                : '0 2px 8px rgba(234, 88, 12, 0.3)',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isLoadingAction ? (
                              <span>Saving...</span>
                            ) : isFeatured ? (
                              <>
                                <EyeOff size={14} />
                                <span>Remove</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} style={{ color: '#fef08a' }} />
                                <span>Add to Client Side</span>
                              </>
                            )}
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev)}
                            title="Delete review"
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: '1px solid #fee2e2',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
