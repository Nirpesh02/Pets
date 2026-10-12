import React, { useState, useEffect } from 'react';
import {
  Tag,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Check,
  Percent,
  X,
  UserCheck,
  AlertCircle,
  Gift,
  Timer,
  ArrowRight,
  Users,
  Zap,
} from 'lucide-react';
import { subscriberApi } from '../../../api/subscriberApi';
import { adminApi } from '../../../api/adminApi';
import { formatDate } from '../../../utils/formatters';
import { DOG_BANNER_PRESETS } from '../../../utils/constants';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';
import StatCard from '../../components/StatCard';

export const ExclusiveCoupons = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [validityMinutes, setValidityMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [autoCreateBanner, setAutoCreateBanner] = useState(true);

  // Dog Banner Generator Modal State (10 Dog Image Presets)
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerSub, setBannerSub] = useState(null);
  const [selectedDogImage, setSelectedDogImage] = useState(DOG_BANNER_PRESETS[0]?.url || '');
  const [dogPresets, setDogPresets] = useState(DOG_BANNER_PRESETS);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerPublishing, setBannerPublishing] = useState(false);
  const [activeBanners, setActiveBanners] = useState([]);

  const toast = useToast();

  const fetchActiveBanners = async () => {
    try {
      const allBanners = await adminApi.getAllBanners();
      const exclusiveList = (allBanners || []).filter((b) => b.isExclusive && b.active);
      setActiveBanners(exclusiveList);
    } catch {
      try {
        const homeBanners = await adminApi.getBanners();
        const exclusiveList = (homeBanners || []).filter((b) => b.isExclusive && b.active);
        setActiveBanners(exclusiveList);
      } catch {}
    }
  };

  const isBannerLiveForCoupon = (code) => {
    if (!code) return false;
    const clean = code.trim().toUpperCase();

    // 1. Check in active banners state from API
    const inActiveBanners = activeBanners.some(
      (b) =>
        b.isExclusive &&
        b.active &&
        b.couponCode &&
        b.couponCode.trim().toUpperCase() === clean &&
        b.expiresAt &&
        new Date(b.expiresAt).getTime() > currentTime
    );
    if (inActiveBanners) return true;

    // 2. Check in fast session cache for instantaneous UI feedback
    try {
      const cachedExp = sessionStorage.getItem(`live_banner_${clean}`);
      if (cachedExp && new Date(cachedExp).getTime() > currentTime) {
        return true;
      }
    } catch {}

    return false;
  };

  const fetchSubscribers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await subscriberApi.getSubscribers();
      setSubscribers(data);
    } catch {
      if (showLoader) toast.error('Failed to load subscribers');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(true);
    fetchActiveBanners();

    // Fetch latest dog image presets from backend seeder if available
    adminApi.getDogImages().then((imgs) => {
      if (imgs && imgs.length > 0) {
        setDogPresets(imgs);
      }
    });

    // Background poll every 8 seconds for fresh subscriber & banner data
    const pollInterval = setInterval(() => {
      fetchSubscribers(false);
      fetchActiveBanners();
    }, 8000);

    return () => clearInterval(pollInterval);
  }, []);

  // Live second-by-second clock so expiration triggers immediately without browser refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filtered subscribers
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.couponCode && sub.couponCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    const allFilteredIds = filteredSubscribers.map((s) => s._id);
    const areAllSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  // Open single approve/edit modal
  const openApproveModal = (sub) => {
    setIsBulkMode(false);
    setSelectedSub(sub);
    const prefix = 'PAW';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setCouponCode(sub.couponCode || `${prefix}${randomSuffix}`);
    setDiscountPercent(sub.discountPercent || 15);
    setValidityMinutes(sub.validityMinutes || 60);
    setModalOpen(true);
  };

  // Open bulk continue modal
  const openBulkModal = () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one customer first');
      return;
    }
    setIsBulkMode(true);
    setSelectedSub(null);
    const prefix = 'OFFER';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setCouponCode(`${prefix}${randomSuffix}`);
    setDiscountPercent(15);
    setValidityMinutes(60);
    setModalOpen(true);
  };

  const getExpiryPreview = (mins) => {
    const d = new Date(Date.now() + (mins || 60) * 60 * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getExpiryInfo = (expiresAt) => {
    if (!expiresAt) return { isExpired: false, label: 'Unlimited' };
    const expMs = new Date(expiresAt).getTime();
    const diff = expMs - currentTime;
    const timeStr = new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diff <= 0) {
      return {
        isExpired: true,
        label: `Expired (${timeStr})`,
      };
    }

    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    let remainingStr = '';
    if (hours > 0) {
      remainingStr = `${hours}h ${mins}m`;
    } else if (mins > 0) {
      remainingStr = `${mins}m ${secs}s`;
    } else {
      remainingStr = `${secs}s`;
    }

    return {
      isExpired: false,
      label: `Up to ${timeStr} (${remainingStr})`,
    };
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const cleanCode = couponCode.trim().toUpperCase();
    const cleanDiscount = Number(discountPercent) || 15;
    const minutes = Number(validityMinutes) || 60;

    try {
      setSubmitting(true);

      if (isBulkMode) {
        // Bulk Approve for all selectedIds
        const res = await subscriberApi.bulkApproveSubscribers({
          ids: selectedIds,
          couponCode: cleanCode,
          discountPercent: cleanDiscount,
          validityMinutes: minutes,
        });

        const updatedIds = selectedIds;
        setSubscribers((prev) =>
          prev.map((s) => {
            if (updatedIds.includes(s._id)) {
              return {
                ...s,
                status: 'approved',
                couponCode: cleanCode,
                discountPercent: cleanDiscount,
                expiresAt: res.expiresAt,
                validityMinutes: minutes,
              };
            }
            return s;
          })
        );

        toast.success(
          `🎉 Successfully issued coupon "${cleanCode}" (${cleanDiscount}% OFF, ${minutes} mins) to ${selectedIds.length} customers!`
        );
        setSelectedIds([]);
        setModalOpen(false);

        // Open Dog Selection modal immediately for bulk approved coupon!
        if (autoCreateBanner) {
          setBannerSub({
            email: `${selectedIds.length} Customers`,
            couponCode: cleanCode,
            discountPercent: cleanDiscount,
            expiresAt: res.expiresAt,
          });
          setSelectedDogImage(dogPresets[0]?.url || DOG_BANNER_PRESETS[0].url);
          setBannerTitle(`Exclusive Flash Deal: ${cleanDiscount}% OFF! 🔥`);
          setBannerSubtitle(
            `Use voucher code "${cleanCode}" at checkout to get instant ${cleanDiscount}% discount on all pet food & grooming essentials!`
          );
          setBannerModalOpen(true);
        }
      } else {
        // Single Approve
        const updated = await subscriberApi.approveSubscriber(selectedSub._id, {
          couponCode: cleanCode,
          discountPercent: cleanDiscount,
          validityMinutes: minutes,
        });

        setSubscribers((prev) =>
          prev.map((s) => (s._id === selectedSub._id ? updated.subscriber : s))
        );
        toast.success(
          `🎉 Approved! Generated coupon "${cleanCode}" (${cleanDiscount}% OFF) valid for ${minutes} mins for ${selectedSub.email}`
        );
        setModalOpen(false);

        // Open Dog Selection modal immediately for single approved coupon!
        if (autoCreateBanner && updated?.subscriber) {
          setBannerSub(updated.subscriber);
          setSelectedDogImage(dogPresets[0]?.url || DOG_BANNER_PRESETS[0].url);
          setBannerTitle(`Exclusive Flash Deal: ${cleanDiscount}% OFF! 🔥`);
          setBannerSubtitle(
            `Use voucher code "${cleanCode}" at checkout to get instant ${cleanDiscount}% discount on all pet food & grooming essentials!`
          );
          setBannerModalOpen(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve subscriber(s)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenBannerModal = (sub) => {
    if (!sub.couponCode) {
      toast.warning('No coupon code assigned to this customer');
      return;
    }
    const expiry = getExpiryInfo(sub.expiresAt);
    if (expiry.isExpired) {
      toast.error(`❌ Coupon "${sub.couponCode}" has expired! Flash banner can only be published for active coupons.`);
      return;
    }

    if (isBannerLiveForCoupon(sub.couponCode)) {
      toast.warning(`⚡ Flash banner for "${sub.couponCode}" is already live on the Homepage! Click is disabled during its active duration.`);
      return;
    }

    setBannerSub(sub);
    setSelectedDogImage(dogPresets[0]?.url || DOG_BANNER_PRESETS[0].url);
    setBannerTitle(`Exclusive Flash Deal: ${sub.discountPercent || 15}% OFF! 🔥`);
    setBannerSubtitle(
      `Use voucher code "${sub.couponCode}" at checkout to get instant ${sub.discountPercent || 15}% discount on all pet food & grooming essentials!`
    );
    setBannerModalOpen(true);
  };

  const handlePublishExclusiveBanner = async (e) => {
    if (e) e.preventDefault();
    if (!bannerSub) return;
    const expiry = getExpiryInfo(bannerSub.expiresAt);
    if (expiry.isExpired) {
      toast.error(`❌ Coupon "${bannerSub.couponCode}" has expired!`);
      setBannerModalOpen(false);
      return;
    }

    if (isBannerLiveForCoupon(bannerSub.couponCode)) {
      toast.warning(`⚡ Flash banner for "${bannerSub.couponCode}" is already live on the Homepage! Click is disabled during its active duration.`);
      setBannerModalOpen(false);
      return;
    }

    try {
      setBannerPublishing(true);
      await adminApi.addBanner({
        title: bannerTitle || `Exclusive Flash Deal: ${bannerSub.discountPercent || 15}% OFF! 🔥`,
        subtitle:
          bannerSubtitle ||
          `Use voucher code "${bannerSub.couponCode}" at checkout to get instant ${bannerSub.discountPercent || 15}% discount on all pet food & grooming essentials!`,
        badge: `⚡ FLASH DEAL • ${bannerSub.discountPercent || 15}% OFF`,
        ctaText: `Claim ${bannerSub.discountPercent || 15}% OFF`,
        ctaLink: '/shop',
        image: selectedDogImage || dogPresets[0]?.url || DOG_BANNER_PRESETS[0].url,
        bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
        active: true,
        isExclusive: true,
        couponCode: bannerSub.couponCode,
        discountPercent: bannerSub.discountPercent || 15,
        expiresAt: bannerSub.expiresAt,
      });

      // Update activeBanners and sessionStorage cache so button disables immediately
      const upperCode = bannerSub.couponCode.trim().toUpperCase();
      try {
        sessionStorage.setItem(`live_banner_${upperCode}`, bannerSub.expiresAt);
      } catch {}

      setActiveBanners((prev) => [
        ...prev.filter((b) => b.couponCode?.trim().toUpperCase() !== upperCode),
        {
          isExclusive: true,
          active: true,
          couponCode: upperCode,
          expiresAt: bannerSub.expiresAt,
        },
      ]);

      toast.success(
        `🎉 Exclusive Flash Banner for "${bannerSub.couponCode}" published! It will stay on Homepage for ${expiry.label}. Other banners are temporarily hidden.`
      );
      setBannerModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate banner');
    } finally {
      setBannerPublishing(false);
    }
  };

  const handleReject = async (sub) => {
    if (!window.confirm(`Reject exclusive offer access for "${sub.email}"?`)) {
      return;
    }

    try {
      const updated = await subscriberApi.rejectSubscriber(sub._id);
      if (sub.couponCode) {
        const clean = sub.couponCode.trim().toUpperCase();
        try {
          sessionStorage.removeItem(`live_banner_${clean}`);
        } catch {}
        setActiveBanners((prev) => prev.filter((b) => b.couponCode?.trim().toUpperCase() !== clean));
      }
      setSubscribers((prev) =>
        prev.map((s) => (s._id === sub._id ? updated.subscriber : s))
      );
      toast.info(`Offer access rejected for ${sub.email}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject subscriber');
    }
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Permanently remove "${sub.email}" from subscriber list?`)) {
      return;
    }

    try {
      await subscriberApi.deleteSubscriber(sub._id);
      if (sub.couponCode) {
        const clean = sub.couponCode.trim().toUpperCase();
        try {
          sessionStorage.removeItem(`live_banner_${clean}`);
        } catch {}
        setActiveBanners((prev) => prev.filter((b) => b.couponCode?.trim().toUpperCase() !== clean));
      }
      setSubscribers((prev) => prev.filter((s) => s._id !== sub._id));
      setSelectedIds((prev) => prev.filter((id) => id !== sub._id));
      toast.success(`Removed ${sub.email}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subscriber');
    }
  };

  const pendingCount = subscribers.filter((s) => s.status === 'pending').length;
  const approvedActiveCount = subscribers.filter(
    (s) => s.status === 'approved' && (!s.expiresAt || new Date(s.expiresAt).getTime() > currentTime)
  ).length;

  const selectedCustomers = subscribers.filter((s) => selectedIds.includes(s._id));

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gift className="text-primary" size={28} />
            Exclusive Offers & Coupon Approvals
          </h1>
          <p className="admin-page-subtitle">
            Select customers below and click "Continue" to generate coupon codes, set discount percentages, and validity duration!
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Join Requests"
          value={subscribers.length}
          icon={Mail}
          subtitle="Newsletter & coupon subscribers"
          variant="primary"
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          icon={Clock}
          subtitle={pendingCount > 0 ? "Requires coupon assignment" : "All requests approved"}
          variant="amber"
        />
        <StatCard
          title="Approved & Active Coupons"
          value={approvedActiveCount}
          icon={Tag}
          subtitle="Active valid discount coupons"
          variant="emerald"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search email or coupon code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Filter size={16} className="text-muted" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Filter:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.15s ease',
                    background: statusFilter === status ? '#eb5e28' : '#ffffff',
                    color: statusFilter === status ? '#ffffff' : '#4b5563',
                    borderColor: statusFilter === status ? '#eb5e28' : '#e5e7eb',
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTINUAL BULK ACTION BAR - Visible when at least 1 customer is selected */}
      {selectedIds.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            border: '1px solid #334155',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: '#eb5e28',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: '0 2px 8px rgba(235, 94, 40, 0.4)',
                flexShrink: 0,
              }}
            >
              {selectedIds.length}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                {selectedIds.length === filteredSubscribers.length
                  ? `All ${filteredSubscribers.length} Customers Selected!`
                  : `${selectedIds.length} of ${filteredSubscribers.length} Customers Selected`}
              </div>
              <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Click Continue to generate coupon code, discount %, and validity time for all of them!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Select All Toggle */}
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {filteredSubscribers.every((s) => selectedIds.includes(s._id))
                ? 'Deselect All'
                : `Select All (${filteredSubscribers.length})`}
            </button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                padding: '8px 12px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>

            {/* CONTINUE BUTTON */}
            <button
              type="button"
              onClick={openBulkModal}
              style={{
                background: '#eb5e28',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(235, 94, 40, 0.45)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Sparkles size={16} />
              Continue ({selectedIds.length})
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <Loader message="Loading subscribers list..." />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Gift size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>No Subscribers Found</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '420px', margin: '8px auto 0' }}>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter selection.'
                : 'When customers enter their email in the footer "Pet Health Tips & Exclusive Offers" section, they will appear right here for approval.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive-wrapper exclusive-coupons-table-desktop">
              <table className="admin-data-table">
                <thead>
                <tr>
                  {/* Checkbox column - Select All appears ONLY when at least 1 customer is selected */}
                  <th style={{ width: '46px', textAlign: 'center' }}>
                    {selectedIds.length > 0 && (
                      <input
                        type="checkbox"
                        checked={
                          filteredSubscribers.length > 0 &&
                          filteredSubscribers.every((s) => selectedIds.includes(s._id))
                        }
                        onChange={handleSelectAll}
                        title="Select All Customers"
                        style={{
                          width: '17px',
                          height: '17px',
                          cursor: 'pointer',
                          accentColor: '#eb5e28',
                        }}
                      />
                    )}
                  </th>

                  {/* Header title */}
                  <th style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Subscriber Email</span>
                      {selectedIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          style={{
                            background: '#eb5e28',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {filteredSubscribers.every((s) => selectedIds.includes(s._id))
                            ? 'Deselect All'
                            : `Select All (${filteredSubscribers.length})`}
                        </button>
                      )}
                    </div>
                  </th>

                  <th style={{ minWidth: '100px' }}>Join Date</th>
                  <th style={{ minWidth: '125px' }}>Approval Status</th>
                  <th style={{ minWidth: '125px' }}>Assigned Coupon</th>
                  <th style={{ minWidth: '95px' }}>Discount</th>
                  <th style={{ minWidth: '135px' }}>Time Limit / Expiry</th>
                  <th style={{ minWidth: '160px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => {
                  const isApproved = sub.status === 'approved';
                  const isPending = sub.status === 'pending';
                  const isRejected = sub.status === 'rejected';
                  const expiryInfo = getExpiryInfo(sub.expiresAt);
                  const isSelected = selectedIds.includes(sub._id);
                  const isBannerLive = isBannerLiveForCoupon(sub.couponCode);

                  return (
                    <tr
                      key={sub._id}
                      style={
                        isSelected
                          ? { background: 'rgba(235, 94, 40, 0.05)' }
                          : {}
                      }
                    >
                      {/* Selection Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub._id)}
                          style={{
                            width: '17px',
                            height: '17px',
                            cursor: 'pointer',
                            accentColor: '#eb5e28',
                          }}
                          aria-label={`Select ${sub.email}`}
                        />
                      </td>

                      {/* Email */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#4b5563',
                            }}
                          >
                            <Mail size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{sub.email}</div>
                            {sub.user && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  color: '#059669',
                                  fontWeight: 600,
                                }}
                              >
                                <UserCheck size={12} /> Registered Account: {sub.user.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td style={{ color: '#6b7280', fontSize: '13px' }}>
                        {formatDate(sub.createdAt || sub.updatedAt)}
                      </td>

                      {/* Status */}
                      <td>
                        {isPending && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#fef3c7',
                              color: '#b45309',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={13} /> Pending Approval
                          </span>
                        )}
                        {isApproved && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#d1fae5',
                              color: '#065f46',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle size={13} /> Approved
                          </span>
                        )}
                        {isRejected && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            <XCircle size={13} /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Coupon Code */}
                      <td>
                        {sub.couponCode ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#fff1ec',
                              color: '#eb5e28',
                              border: '1px dashed #eb5e28',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '13px',
                              letterSpacing: '0.5px',
                            }}
                          >
                            <Tag size={13} /> {sub.couponCode}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>—</span>
                        )}
                      </td>

                      {/* Discount % */}
                      <td>
                        {sub.discountPercent ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color: '#059669',
                              fontSize: '13px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Percent size={13} /> {sub.discountPercent}% OFF
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>—</span>
                        )}
                      </td>

                      {/* Time Limit / Expiry */}
                      <td>
                        {isApproved ? (
                          sub.expiresAt ? (
                            expiryInfo.isExpired ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                }}
                              >
                                <AlertCircle size={12} /> {expiryInfo.label}
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                }}
                              >
                                <Clock size={12} /> {expiryInfo.label}
                              </span>
                            )
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>
                              Unlimited
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => openApproveModal(sub)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isApproved ? '#f3f4f6' : '#10b981',
                              color: isApproved ? '#374151' : '#ffffff',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                            title={isApproved ? 'Edit Coupon Code & Validity' : 'Approve & Issue Coupon Code'}
                          >
                            {isApproved ? (
                              <>
                                <Tag size={12} /> Edit
                              </>
                            ) : (
                              <>
                                <Check size={12} /> Approve
                              </>
                            )}
                          </button>

                          {/* Banner button is only available for active, non-expired coupons */}
                          {isApproved && sub.couponCode && !expiryInfo.isExpired && (
                            isBannerLive ? (
                              <button
                                type="button"
                                disabled
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  border: '1px solid #86efac',
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none',
                                  opacity: 0.95,
                                  whiteSpace: 'nowrap',
                                }}
                                title={`⚡ Exclusive Flash Banner is currently LIVE on Homepage until ${expiryInfo.label}. Clicking is disabled while active.`}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#22c55e',
                                    boxShadow: '0 0 6px rgba(34, 197, 94, 0.8)',
                                    display: 'inline-block',
                                  }}
                                />
                                Live on Home
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenBannerModal(sub)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #fed7aa',
                                  background: '#fffaf0',
                                  color: '#ea580c',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Generate & Publish Homepage Promo Banner for this Coupon"
                              >
                                <Sparkles size={12} /> Banner
                              </button>
                            )
                          )}

                          {!isRejected && (
                            <button
                              type="button"
                              onClick={() => handleReject(sub)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                background: '#fff5f5',
                                color: '#dc2626',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                              title="Reject Offer Access"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(sub)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb',
                              background: '#f9fafb',
                              color: '#6b7280',
                              cursor: 'pointer',
                            }}
                            title="Delete Subscriber"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Customer Cards View (Visible on screens <= 768px) */}
          <div className="exclusive-mobile-cards-view">
            {filteredSubscribers.map((sub) => {
              const isApproved = sub.status === 'approved';
              const isPending = sub.status === 'pending';
              const isRejected = sub.status === 'rejected';
              const expiryInfo = getExpiryInfo(sub.expiresAt);
              const isSelected = selectedIds.includes(sub._id);
              const isBannerLive = isBannerLiveForCoupon(sub.couponCode);

              return (
                <div
                  key={sub._id}
                  className={`exclusive-mobile-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="mobile-card-top-row">
                    <label className="mobile-card-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(sub._id)}
                        className="mobile-card-checkbox"
                      />
                      <div className="mobile-card-email-info">
                        <span className="mobile-card-email">{sub.email}</span>
                        <span className="mobile-card-date">{formatDate(sub.createdAt || sub.updatedAt)}</span>
                      </div>
                    </label>

                    {isPending && (
                      <span className="mobile-status-pill pending">
                        <Clock size={11} /> Pending
                      </span>
                    )}
                    {isApproved && (
                      <span className="mobile-status-pill approved">
                        <CheckCircle size={11} /> Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="mobile-status-pill rejected">
                        <XCircle size={11} /> Rejected
                      </span>
                    )}
                  </div>

                  <div className="mobile-card-coupon-row">
                    {sub.couponCode ? (
                      <span className="mobile-coupon-badge">🎟️ {sub.couponCode}</span>
                    ) : (
                      <span className="mobile-no-coupon">No coupon assigned</span>
                    )}

                    {sub.discountPercent ? (
                      <span className="mobile-discount-badge">%{sub.discountPercent}% OFF</span>
                    ) : null}

                    {isApproved && sub.expiresAt && (
                      <span className={`mobile-expiry-badge ${expiryInfo.isExpired ? 'expired' : ''}`}>
                        <Clock size={11} /> {expiryInfo.label}
                      </span>
                    )}
                  </div>

                  <div className="mobile-card-actions-row">
                    <button
                      type="button"
                      onClick={() => openApproveModal(sub)}
                      className={`mobile-act-btn ${isApproved ? 'edit' : 'approve'}`}
                    >
                      {isApproved ? (
                        <>
                          <Tag size={13} /> Edit
                        </>
                      ) : (
                        <>
                          <Check size={13} /> Approve
                        </>
                      )}
                    </button>

                    {/* Banner button is only available for active, non-expired coupons */}
                    {isApproved && sub.couponCode && !expiryInfo.isExpired && (
                      isBannerLive ? (
                        <button
                          type="button"
                          disabled
                          className="mobile-act-btn banner-live"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            cursor: 'not-allowed',
                            pointerEvents: 'none',
                            opacity: 0.95,
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                          title={`⚡ Exclusive Flash Banner is currently LIVE on Homepage until ${expiryInfo.label}. Clicking is disabled while active.`}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#22c55e',
                              boxShadow: '0 0 6px rgba(34, 197, 94, 0.8)',
                              display: 'inline-block',
                            }}
                          />
                          Live on Home
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenBannerModal(sub)}
                          className="mobile-act-btn banner"
                        >
                          <Sparkles size={13} /> Banner
                        </button>
                      )
                    )}

                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleReject(sub)}
                        className="mobile-act-btn reject"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(sub)}
                      className="mobile-act-btn delete"
                      title="Delete Subscriber"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>

      {/* Approval & Coupon Generation Modal (Single & Bulk Mode) */}
      {modalOpen && (selectedSub || (isBulkMode && selectedIds.length > 0)) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                    {isBulkMode
                      ? `Issue Exclusive Offer (${selectedIds.length} Customers)`
                      : selectedSub?.status === 'approved'
                      ? 'Edit Coupon & Validity'
                      : 'Approve & Issue Coupon'}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {isBulkMode
                      ? `Generate discount coupon for ${selectedIds.length} selected customer(s)`
                      : `for ${selectedSub?.email}`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleApproveSubmit} style={{ padding: '24px' }}>
              {/* Selected Customer Emails Chip List for Bulk Mode */}
              {isBulkMode && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    <Users size={14} className="text-primary" /> Target Selected Customers ({selectedIds.length})
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      maxHeight: '90px',
                      overflowY: 'auto',
                      padding: '8px 10px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {selectedCustomers.map((s) => (
                      <span
                        key={s._id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#334155',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Mail size={11} className="text-muted" /> {s.email}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Informational Hint */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: '1.5',
                }}
              >
                <strong>ℹ️ Live Notification & Real-time Expiry:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  {isBulkMode
                    ? `All ${selectedIds.length} customers will instantly receive this coupon in their Notification Bell with live countdowns!`
                    : 'The client will receive an instant notification bell alert with a live real-time countdown timer.'}
                </p>
              </div>

              {/* Coupon Code Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Coupon Code
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PAW15"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const num = Math.floor(100 + Math.random() * 900);
                      setCouponCode(`PAW${num}`);
                    }}
                    style={{
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#4b5563',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🎲 Auto-Code
                  </button>
                </div>
              </div>

              {/* Discount Percentage */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Discount Percentage (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    style={{
                      width: '120px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>% OFF order total</span>
                </div>
              </div>

              {/* Time Validity Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Timer size={15} className="text-primary" /> Coupon Validity Time Duration
                  </span>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                    {validityMinutes < 60
                      ? `${validityMinutes} Minutes`
                      : `${Math.round((validityMinutes / 60) * 10) / 10} Hours`}
                  </span>
                </label>

                {/* Preset quick buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {[
                    { label: '30 Minutes', value: 30 },
                    { label: '1 Hour', value: 60 },
                    { label: '2 Hours', value: 120 },
                    { label: '6 Hours', value: 360 },
                    { label: '24 Hours', value: 1440 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValidityMinutes(item.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        transition: 'all 0.15s ease',
                        background: validityMinutes === item.value ? '#eb5e28' : '#ffffff',
                        color: validityMinutes === item.value ? '#ffffff' : '#374151',
                        borderColor: validityMinutes === item.value ? '#eb5e28' : '#d1d5db',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={validityMinutes}
                    onChange={(e) => setValidityMinutes(Number(e.target.value) || 30)}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Custom minutes</span>
                </div>

                {/* Expiry preview card */}
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    fontSize: '12.5px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Clock size={15} />
                  <span>
                    Valid up to: <strong>Today at {getExpiryPreview(validityMinutes)}</strong>
                  </span>
                </div>
              </div>

              {/* Auto Promo Banner Checkbox */}
              <div
                style={{
                  background: '#fff7ed',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '22px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#9a3412',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoCreateBanner}
                    onChange={(e) => setAutoCreateBanner(e.target.checked)}
                    style={{
                      width: '17px',
                      height: '17px',
                      accentColor: '#eb5e28',
                      cursor: 'pointer',
                    }}
                  />
                  <span>🎨 Auto-Publish Homepage Promo Banner for this Offer</span>
                </label>
                <p style={{ margin: '4px 0 0 27px', fontSize: '12px', color: '#c2410c', lineHeight: '1.4' }}>
                  When checked, saving will immediately open the Dog Photo Selector so you can choose 1 of 10 dogs and launch your flash banner!
                </p>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {submitting
                    ? 'Processing...'
                    : isBulkMode
                    ? `Issue to ${selectedIds.length} Customers`
                    : 'Save & Issue Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dog Banner Generator Modal (10 Dog Image Picker) */}
      {bannerModalOpen && bannerSub && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              maxWidth: '860px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#fff1ec',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.2)',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    Auto-Generate Homepage Flash Banner
                  </h3>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Select 1 of 10 curated dog photos to create an exclusive flash deal on the Storefront Homepage!
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handlePublishExclusiveBanner} style={{ padding: '24px' }}>
              {/* Coupon Info & Expiry Strip */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: '#ea580c',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '14px',
                      letterSpacing: '1px',
                    }}
                  >
                    🎟️ {bannerSub.couponCode}
                  </span>
                  <span
                    style={{
                      background: '#ffffff',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {bannerSub.discountPercent || 15}% OFF
                  </span>
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Clock size={13} /> {getExpiryInfo(bannerSub.expiresAt).label}
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', color: '#9a3412', fontWeight: 600 }}>
                  Customer: <strong>{bannerSub.email}</strong>
                </div>
              </div>

              {/* Behavior Notice */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '22px',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  <Zap size={15} style={{ color: '#ea580c' }} />
                  <span>Exclusive Homepage Takeover Rule:</span>
                </div>
                <span>
                  While this coupon is active, <strong>all standard banners will be hidden</strong> and this auto-generated dog banner will be displayed exclusively on the Homepage. Once the coupon duration expires ({getExpiryInfo(bannerSub.expiresAt).label}), this banner will automatically vanish and standard banners will be restored!
                </span>
              </div>

              {/* Step 1: Dog Selection Grid (10 Dogs) */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '10px',
                  }}
                >
                  <span>🐾 Step 1: Select Dog Photo (10 Curated Breed Presets)</span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    Click an image to select
                  </span>
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {dogPresets.map((dog, idx) => {
                    const isSelected = selectedDogImage === dog.url;
                    return (
                      <div
                        key={dog.id || idx}
                        onClick={() => setSelectedDogImage(dog.url)}
                        style={{
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: isSelected ? '3px solid #ea580c' : '2px solid #e2e8f0',
                          boxShadow: isSelected
                            ? '0 0 0 3px rgba(234, 88, 12, 0.25), 0 8px 16px rgba(0,0,0,0.1)'
                            : '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.18s ease',
                          background: '#ffffff',
                          transform: isSelected ? 'scale(1.02)' : 'none',
                        }}
                      >
                        <div style={{ position: 'relative', paddingTop: '75%', background: '#f1f5f9' }}>
                          <img
                            src={dog.url}
                            alt={dog.name || dog.breed}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: '#ea580c',
                                color: '#ffffff',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              }}
                            >
                              <Check size={14} />
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isSelected ? '#ea580c' : '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={dog.name}
                          >
                            {dog.name || `Dog #${idx + 1}`}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {dog.breed}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Live Banner Preview */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '10px',
                  }}
                >
                  👁️ Step 2: Live Homepage Preview
                </label>

                <div
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: '220px',
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.85)), url(${selectedDogImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '24px 28px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Flash Tag in Preview */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      marginBottom: '10px',
                    }}
                  >
                    <Zap size={13} style={{ color: '#fef08a' }} />
                    <span>FLASH DEAL:</span>
                    <span style={{ color: '#fef08a', fontFamily: 'monospace' }}>
                      ⏱️ {getExpiryInfo(bannerSub.expiresAt).label}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      margin: '0 0 8px',
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {bannerTitle}
                  </h3>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#f8fafc',
                      margin: '0 0 14px',
                      maxWidth: '560px',
                      lineHeight: '1.45',
                      opacity: 0.95,
                    }}
                  >
                    {bannerSubtitle}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        background: '#ea580c',
                        color: '#ffffff',
                        padding: '7px 16px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                      }}
                    >
                      Claim {bannerSub.discountPercent || 15}% OFF →
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(6px)',
                        color: '#fef08a',
                        border: '1px dashed rgba(255, 255, 255, 0.6)',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                      }}
                    >
                      Voucher: {bannerSub.couponCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Customize Banner Texts (Optional) */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '8px',
                  }}
                >
                  ✏️ Step 3: Headline & Subtitle (Auto-filled)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <input
                      type="text"
                      required
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="Banner Title"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="Banner Subtitle description"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '18px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bannerPublishing}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: bannerPublishing ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
                  }}
                >
                  <Sparkles size={16} />
                  {bannerPublishing
                    ? 'Publishing Flash Banner...'
                    : `Publish Flash Banner (${bannerSub.couponCode})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusiveCoupons;
