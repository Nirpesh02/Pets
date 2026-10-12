import React, { useState, useEffect, useRef } from 'react';
import { Bell, Tag, Check, Copy, Sparkles, Clock, AlertCircle, X, Timer } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';
import { subscriberApi } from '../../api/subscriberApi';

// Subcomponent for countdown timer and expiry info
const CouponCountdown = ({ expiresAt, couponCode }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(expiresAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        window.dispatchEvent(
          new CustomEvent('coupon:expired', { detail: { couponCode } })
        );
        return;
      }

      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const expiryDate = new Date(expiresAt);
  const formattedExpiryTime = expiryDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isExpired) {
    return (
      <div
        style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          borderRadius: '8px',
          padding: '8px 10px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <AlertCircle size={15} />
        <span>This coupon was valid up to {formattedExpiryTime} and has now expired.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1e40af',
        borderRadius: '8px',
        padding: '8px 10px',
        fontSize: '12px',
        marginBottom: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <Clock size={14} style={{ color: '#2563eb' }} />
          <span>
            You can use this code up to: <strong style={{ color: '#1d4ed8' }}>{formattedExpiryTime}</strong>
          </span>
        </div>
        <div
          style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'monospace',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Timer size={11} /> {timeLeft || 'Calculating...'}
        </div>
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const { promoCode, removePromoCode, applyPromoCode } = useCart();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const dropdownRef = useRef(null);

  const getActiveEmail = () => {
    return (
      user?.email ||
      localStorage.getItem('pawnepal_newsletter_email') ||
      ''
    ).trim();
  };

  const fetchNotifications = async () => {
    const email = getActiveEmail();
    if (!email) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await subscriberApi.getNotifications(email);
      setNotifications(data || []);

      // If the currently applied promo code has expired, immediately remove it!
      if (data && promoCode) {
        const matchingNotif = data.find((n) => n.couponCode === promoCode);
        if (
          matchingNotif &&
          (matchingNotif.isExpired ||
            (matchingNotif.expiresAt && Date.now() >= new Date(matchingNotif.expiresAt).getTime()))
        ) {
          removePromoCode();
        }
      }

      // Calculate unread (e.g. approved but not read yet and not expired)
      const unread = (data || []).filter(
        (n) => !n.isRead && n.type === 'coupon_approved' && !n.isExpired
      ).length;
      setUnreadCount(unread);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for footer join event
    const handleJoined = () => {
      fetchNotifications();
    };
    window.addEventListener('newsletter:joined', handleJoined);

    // Poll every 10 seconds to catch Admin approval in real time
    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      window.removeEventListener('newsletter:joined', handleJoined);
      clearInterval(interval);
    };
  }, [user]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && unreadCount > 0) {
      const email = getActiveEmail();
      if (email) {
        await subscriberApi.markNotificationsRead(email);
        setUnreadCount(0);
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleApplyToCart = async (code) => {
    const success = await applyPromoCode(code);
    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <div className="notification-bell-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="nav-cart-btn notification-icon-btn"
        onClick={handleToggle}
        aria-label="Notifications"
        title="Exclusive Offers & Notifications"
        style={{
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="cart-badge-count notification-badge"
            style={{
              background: '#eb5e28',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          className="notification-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            maxWidth: '92vw',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="text-primary" />
              <strong style={{ fontSize: '14px', color: '#111827' }}>Notifications & Offers</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    color: '#eb5e28',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                  }}
                >
                  <Tag size={20} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  No Active Offers Yet
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                  Join via <strong>"Pet Health Tips & Exclusive Offers"</strong> in our footer to receive exclusive coupon codes!
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isApproved = notif.type === 'coupon_approved';
                const isExpired = notif.isExpired;

                return (
                  <div
                    key={notif.id}
                    style={{
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '10px',
                      border: isExpired
                        ? '1px solid #fecaca'
                        : isApproved
                        ? '1px solid #bbf7d0'
                        : '1px solid #fed7aa',
                      background: isExpired
                        ? '#fff5f5'
                        : isApproved
                        ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'
                        : '#fffbeb',
                    }}
                  >
                    {/* Status Title */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isExpired ? '#b91c1c' : isApproved ? '#15803d' : '#b45309',
                        }}
                      >
                        {isExpired ? (
                          <>
                            <AlertCircle size={14} /> Coupon Expired
                          </>
                        ) : isApproved ? (
                          <>
                            <Sparkles size={14} /> Exclusive Coupon Approved!
                          </>
                        ) : (
                          <>
                            <Clock size={14} /> Pending Admin Approval
                          </>
                        )}
                      </span>
                      {notif.discountPercent && isApproved && (
                        <span
                          style={{
                            background: isExpired ? '#9ca3af' : '#15803d',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          {notif.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Expiry / Time Limit Countdown Banner */}
                    {isApproved && notif.expiresAt && (
                      <CouponCountdown expiresAt={notif.expiresAt} couponCode={notif.couponCode} />
                    )}

                    {/* Description Message */}
                    <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#4b5563', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>

                    {/* Approved Coupon Ticket Box */}
                    {isApproved && notif.couponCode && (
                      <div
                        style={{
                          background: '#ffffff',
                          border: isExpired ? '1.5px dashed #d1d5db' : '1.5px dashed #10b981',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          opacity: isExpired ? 0.65 : 1,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                            Your Exclusive Promo Code
                          </div>
                          <div
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '16px',
                              color: isExpired ? '#6b7280' : '#047857',
                              letterSpacing: '1px',
                            }}
                          >
                            {notif.couponCode}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            disabled={isExpired}
                            onClick={() => handleCopyCode(notif.couponCode)}
                            style={{
                              border: '1px solid #d1d5db',
                              background: '#f9fafb',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#374151',
                              cursor: isExpired ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Copy coupon code"
                          >
                            {copiedCode === notif.couponCode ? (
                              <>
                                <Check size={12} className="text-primary" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copy
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isExpired}
                            onClick={() => handleApplyToCart(notif.couponCode)}
                            style={{
                              border: 'none',
                              background: isExpired ? '#9ca3af' : '#eb5e28',
                              color: '#ffffff',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: isExpired ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                            title={isExpired ? 'Coupon has expired' : 'Apply to current cart'}
                          >
                            {isExpired ? 'Expired' : 'Apply to Cart'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
