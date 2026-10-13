import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Zap,
  Edit3,
  ArrowRight,
  X,
  Palette,
} from 'lucide-react';
import { adminApi } from '../../../api/adminApi';
import { uploadApi } from '../../../api/uploadApi';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';

// 5 Curated 1-Click Auto Banner Presets
const AUTO_PRESETS = [
  {
    id: 'dog_food_deal',
    title: 'Kathmandu Valley Super Dog Sale 🐾',
    subtitle: 'Flat 20% OFF on vet-approved Royal Canin & Drools dog nutrition! Same-day express delivery inside Ring Road.',
    badge: '🔥 20% OFF Special',
    ctaText: 'Shop Dog Food',
    ctaLink: '/shop?category=food&petType=dog',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
    tag: '🐶 Dog Nutrition',
    iconColor: '#ea580c',
  },
  {
    id: 'cat_treats_deal',
    title: 'Himalayan Catnip & Gourmet Treats 🐱',
    subtitle: 'Pamper your feline companion with pure salmon treats, dental chews, and premium wet food blends at 15% discount.',
    badge: '🐱 Cat Care Special',
    ctaText: 'Explore Cat Treats',
    ctaLink: '/shop?category=treats&petType=cat',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
    tag: '🐱 Cat Treats',
    iconColor: '#7c3aed',
  },
  {
    id: 'free_delivery',
    title: 'Zero Delivery Fee Inside Kathmandu Valley 🚚',
    subtitle: 'Order above Rs. 1,500 and enjoy guaranteed same-day doorstep delivery. Cash on Delivery & QR payment accepted.',
    badge: '🚚 Valley Free Delivery',
    ctaText: 'Order Essentials Now',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
    tag: '🚚 Free Valley Shipping',
    iconColor: '#0d9488',
  },
  {
    id: 'monsoon_tick',
    title: 'Monsoon Flea & Tick Defence Shield 🛡️',
    subtitle: 'Vet-certified Ayurvedic Neem Shampoos, tick sprays & grooming combs for complete monsoon protection.',
    badge: '🌿 Ayurvedic Care',
    ctaText: 'Shop Tick Protection',
    ctaLink: '/shop?category=grooming',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
    tag: '🛁 Grooming & Care',
    iconColor: '#0284c7',
  },
  {
    id: 'exclusive_coupon_offer',
    title: 'Exclusive Pet Health Club Offer 🎁',
    subtitle: 'Get instant discounts on your order total with exclusive subscriber vouchers! Check your notification bell for active codes.',
    badge: '⭐ VIP Exclusive Offer',
    ctaText: 'Claim Your Discount',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    tag: '🎟️ VIP Coupon Deal',
    iconColor: '#f59e0b',
  },
];

// Curated HD Pet Images
const CURATED_IMAGES = [
  { label: 'Golden Retriever', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Cute Kitten', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Dog Outdoors', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Pet Food Dish', url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Clean Groomed Dog', url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Puppy Blanket', url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=1200&auto=format&fit=crop&q=80' },
];

// Gradient Color Themes
const GRADIENT_THEMES = [
  { label: 'Sunset Orange', value: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)', color: '#ea580c' },
  { label: 'Emerald Teal', value: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)', color: '#0d9488' },
  { label: 'Royal Violet', value: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)', color: '#7c3aed' },
  { label: 'Ocean Blue', value: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)', color: '#0284c7' },
  { label: 'Warm Amber', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)', color: '#f59e0b' },
  { label: 'Midnight Slate', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#1e293b' },
];

export const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAutoSection, setShowAutoSection] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isBannerDragging, setIsBannerDragging] = useState(false);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'Special Offer',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
    active: true,
  });

  const toast = useToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllBanners();
      setBanners(data);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (banner) => {
    const bannerId = banner._id || banner.id;
    try {
      await adminApi.updateBanner(bannerId, { active: !banner.active });
      setBanners((prev) =>
        prev.map((b) => ((b._id || b.id) === bannerId ? { ...b, active: !b.active } : b))
      );
      toast.success(`Banner status toggled to ${!banner.active ? '🟢 Live on Store' : '⚪ Hidden'}`);
    } catch {
      toast.error('Could not update banner status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotional banner?')) {
      try {
        await adminApi.deleteBanner(id);
        setBanners((prev) => prev.filter((b) => (b._id || b.id) !== id));
        toast.success('Banner deleted');
      } catch {
        toast.error('Could not delete banner');
      }
    }
  };

  // Open modal in create mode
  const openCreateModal = () => {
    setEditingBannerId(null);
    setFormData({
      title: 'Kathmandu Valley Super Monsoon Sale 🌧️',
      subtitle: 'Flat 20% off all vet-approved tick shampoos, puppy nutrition & supplements!',
      badge: 'Special Offer',
      ctaText: 'Shop Deals Now',
      ctaLink: '/shop',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
      active: true,
    });
    setIsAddModalOpen(true);
  };

  // Open modal in edit mode
  const openEditModal = (banner) => {
    setEditingBannerId(banner._id || banner.id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badge: banner.badge || 'Special Offer',
      ctaText: banner.ctaText || 'Shop Now',
      ctaLink: banner.ctaLink || '/shop',
      image: banner.image || CURATED_IMAGES[0].url,
      bgGradient: banner.bgGradient || GRADIENT_THEMES[0].value,
      active: banner.active !== undefined ? banner.active : true,
    });
    setIsAddModalOpen(true);
  };

  // 1-Click Instant Auto-Publish from Presets
  const handleQuickPublishPreset = async (preset) => {
    try {
      setSubmitting(true);
      const payload = {
        title: preset.title,
        subtitle: preset.subtitle,
        badge: preset.badge,
        ctaText: preset.ctaText,
        ctaLink: preset.ctaLink,
        image: preset.image,
        bgGradient: preset.bgGradient,
        active: true,
      };

      const created = await adminApi.addBanner(payload);
      setBanners((prev) => [...prev, created]);
      toast.success(`🎉 Auto-Banner "${preset.title}" published directly to Store Homepage!`);
    } catch {
      toast.error('Failed to create banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Load a preset into form
  const applyPresetToForm = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      subtitle: preset.subtitle,
      badge: preset.badge,
      ctaText: preset.ctaText,
      ctaLink: preset.ctaLink,
      image: preset.image,
      bgGradient: preset.bgGradient,
    }));
    toast.info(`Loaded "${preset.tag}" template into editor!`);
  };

  // Handle local single image file upload (strictly 1 image only)
  const handleImageFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if multiple images were selected
    if (files.length > 1) {
      toast.error('Multi image not support');
      e.target.value = '';
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      e.target.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadApi.uploadSingle(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success('Banner image uploaded successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload banner image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerDrop = async (e) => {
    e.preventDefault();
    setIsBannerDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Reject multiple images
    if (files.length > 1) {
      toast.error('Multi image not support');
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadApi.uploadSingle(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      toast.success('Banner image uploaded successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload banner image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save or update banner
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subtitle.trim()) {
      toast.error('Title and subtitle are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBannerId) {
        // Update existing banner
        const updated = await adminApi.updateBanner(editingBannerId, formData);
        setBanners((prev) =>
          prev.map((b) => ((b._id || b.id) === editingBannerId ? updated : b))
        );
        toast.success('Banner updated successfully!');
      } else {
        // Create new banner
        const created = await adminApi.addBanner(formData);
        setBanners((prev) => [...prev, created]);
        toast.success('🎉 Promotional Banner published to Homepage!');
      }
      setIsAddModalOpen(false);
      setEditingBannerId(null);
    } catch {
      toast.error('Could not save banner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-header-title-box">
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles className="text-primary" size={26} />
            Homepage Promotional Banners
          </h1>
          <p className="admin-page-subtitle">
            Create and manage visual hero sliders, Valley shipping notices, and seasonal auto-banners for the store homepage.
          </p>
        </div>

        <div className="admin-header-actions">
          <Button
            variant="outline"
            icon={Zap}
            onClick={() => setShowAutoSection((prev) => !prev)}
            style={{ borderColor: '#eb5e28', color: '#eb5e28', fontWeight: 600 }}
          >
            {showAutoSection ? 'Hide Auto Presets' : '✨ Auto-Banner Presets'}
          </Button>

          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Create Custom Banner
          </Button>
        </div>
      </div>

      {/* ✨ 1-CLICK AUTO BANNER GENERATOR SECTION */}
      {showAutoSection && (
        <div className="auto-banner-panel">
          <div className="auto-banner-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: '#eb5e28',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(235, 94, 40, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#1f2937' }}>
                  ✨ 1-Click Auto Banner Generator
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Pick any pre-configured template below to publish immediately without manual typing!
                </p>
              </div>
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="auto-presets-grid">
            {AUTO_PRESETS.map((preset) => (
              <div
                key={preset.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #fed7aa',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <img
                    src={preset.image}
                    alt={preset.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#fff7ed',
                        color: preset.iconColor,
                        border: `1px solid ${preset.iconColor}33`,
                        marginBottom: '4px',
                      }}
                    >
                      {preset.badge}
                    </span>
                    <h4
                      style={{
                        margin: '0 0 4px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={preset.title}
                    >
                      {preset.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#6b7280',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.35',
                      }}
                    >
                      {preset.subtitle}
                    </p>
                  </div>
                </div>

                {/* Preset action buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed #f3f4f6' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickPublishPreset(preset)}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      background: '#eb5e28',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <Zap size={13} /> Quick Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyPresetToForm(preset);
                      setEditingBannerId(null);
                      setIsAddModalOpen(true);
                    }}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '7px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BANNERS LIST */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
          Current Active & Stored Banners ({banners.length})
        </h2>
        <span style={{ fontSize: '12.5px', color: '#6b7280' }}>
          Live banners rotate automatically every 5.5s on the customer home slider
        </span>
      </div>

      {loading ? (
        <Loader size="md" text="Loading banners..." />
      ) : banners.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px dashed #e5e7eb',
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <Sparkles size={48} style={{ color: '#eb5e28', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>No Promotional Banners Yet</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '420px', margin: '8px auto 20px' }}>
            Click any of the 1-Click Auto Banner Presets above or create a custom hero slider for your shop!
          </p>
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Create First Banner
          </Button>
        </div>
      ) : (
        <div className="banners-admin-grid">
          {banners.map((b) => {
            const bannerId = b._id || b.id;
            return (
              <div
                key={bannerId}
                className="banner-card-admin"
                style={{
                  opacity: b.active ? 1 : 0.65,
                }}
              >
                {/* Visual Banner Preview Box */}
                <div
                  className="banner-card-preview"
                  style={{
                    background: b.bgGradient || '#333',
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url(${b.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      background: 'rgba(235, 94, 40, 0.95)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {b.badge || 'Special Offer'}
                  </div>

                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: '16.5px',
                      fontWeight: 800,
                      lineHeight: '1.25',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {b.title}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '12px',
                      opacity: 0.9,
                      lineHeight: '1.35',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {b.subtitle}
                  </p>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#fed7aa',
                    }}
                  >
                    {b.ctaText || 'Shop Now'} →
                    <span style={{ fontSize: '11px', opacity: 0.75, fontWeight: 400 }}>({b.ctaLink || '/shop'})</span>
                  </div>
                </div>

                {/* Card Actions Bottom Strip */}
                <div className="banner-card-bottom-strip">
                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: b.active ? '#059669' : '#6b7280',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: b.active ? '#10b981' : '#9ca3af',
                        }}
                      />
                      {b.active ? 'Live on Store' : 'Hidden / Inactive'}
                    </span>
                  </div>

                  <div className="banner-card-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Toggle Active / Hide */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(b)}
                      title={b.active ? 'Hide from homepage slider' : 'Publish to homepage slider'}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: b.active ? '#059669' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {b.active ? <EyeOff size={15} /> : <Eye size={15} />}
                      {b.active ? 'Hide' : 'Show'}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      title="Edit banner content"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      <Edit3 size={15} /> Edit
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(bannerId)}
                      title="Delete banner permanently"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT BANNER MODAL WITH LIVE PREVIEW */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingBannerId ? 'Edit Promotional Homepage Banner' : 'Create Homepage Promo Banner'}
        subtitle="This visual banner will rotate in the hero section at the top of the store homepage."
        size="lg"
      >
        {/* Preset Quick Fill Chips */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>
            ⚡ 1-Click Template Fill:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {AUTO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPresetToForm(p)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#eb5e28';
                  e.currentTarget.style.color = '#eb5e28';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                {p.tag}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE REAL-TIME PREVIEW */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>
            👁️ Real-Time Storefront Hero Preview:
          </label>
          <div
            style={{
              position: 'relative',
              borderRadius: '14px',
              padding: 'clamp(16px, 4vw, 24px) clamp(14px, 4vw, 28px)',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: formData.bgGradient || '#333',
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url(${formData.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(235, 94, 40, 0.95)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                marginBottom: '10px',
              }}
            >
              {formData.badge || 'Special Offer'}
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.6)', wordBreak: 'break-word' }}>
              {formData.title || 'Enter your headline title...'}
            </h3>

            <p style={{ margin: '0 0 14px', fontSize: 'clamp(12px, 3vw, 13.5px)', opacity: 0.92, maxWidth: '520px', textShadow: '0 1px 3px rgba(0,0,0,0.6)', lineHeight: 1.4 }}>
              {formData.subtitle || 'Enter your promotional subtitle description...'}
            </p>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#eb5e28',
                  color: '#ffffff',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                }}
              >
                {formData.ctaText || 'Shop Now'} <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSaveBanner} className="banner-form">
          <Input
            label="Main Headline Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Kathmandu Valley Super Monsoon Sale 🌧️"
            required
          />

          <Input
            label="Subtitle / Promotional Offer Details *"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g. 20% off all vet-approved tick shampoos & dog food. Same-day delivery inside Ring Road."
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px' }}>
            <Input
              label="Badge Tag Text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="e.g. Special Offer, 20% OFF"
            />
            <Input
              label="CTA Button Text"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              placeholder="e.g. Shop Now"
            />
            <Input
              label="Destination Link"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              placeholder="e.g. /shop or /shop?category=food"
            />
          </div>

          {/* BACKGROUND IMAGE SELECTION */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              🖼️ Banner Background Image * <span style={{ fontSize: '12px', fontWeight: 400, color: '#6b7280' }}>(Single image upload only)</span>
            </label>

            {/* Hidden Single/Multi file Input (multiple enabled to intercept multi-selection) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageFileUpload}
              disabled={uploadingImage}
            />

            {/* Single Image Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsBannerDragging(true);
              }}
              onDragLeave={() => setIsBannerDragging(false)}
              onDrop={handleBannerDrop}
              style={{
                border: isBannerDragging ? '2px dashed #ea580c' : '2px dashed #cbd5e1',
                backgroundColor: isBannerDragging ? '#fff7ed' : '#f8fafc',
                borderRadius: '12px',
                padding: '20px 16px',
                textAlign: 'center',
                cursor: uploadingImage ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#ffedd5',
                  color: '#ea580c',
                  marginBottom: '6px',
                }}
              >
                <Upload size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '3px' }}>
                {uploadingImage ? 'Uploading banner image to server...' : 'Click to Upload Banner Image or Drag & Drop'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                PNG, JPG, JPEG, WEBP • <strong>Single image only</strong>
              </div>
            </div>

            {/* Current Selected Image View */}
            {formData.image && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}
              >
                <img
                  src={formData.image}
                  alt="Banner preview"
                  style={{
                    width: '68px',
                    height: '44px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                    Selected Banner Photo
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {formData.image}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  Change Photo
                </button>
              </div>
            )}

            {/* Curated Gallery Thumbnails Option */}
            <div style={{ marginTop: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                Or select from high-resolution pet presets:
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingTop: '6px',
                  paddingBottom: '4px',
                }}
              >
                {CURATED_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: img.url })}
                    style={{
                      border: formData.image === img.url ? '2px solid #ea580c' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '2px',
                      background: '#ffffff',
                      cursor: 'pointer',
                      flexShrink: 0,
                      textAlign: 'center',
                    }}
                    title={img.label}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      style={{ width: '56px', height: '36px', objectFit: 'cover', borderRadius: '5px', display: 'block' }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#6b7280', display: 'block', maxWidth: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GRADIENT OVERLAY SELECTION */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              🎨 Gradient Overlay Theme:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {GRADIENT_THEMES.map((th) => (
                <button
                  key={th.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, bgGradient: th.value })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: formData.bgGradient === th.value ? '2px solid #eb5e28' : '1px solid #d1d5db',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: th.color,
                      display: 'inline-block',
                    }}
                  />
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* MODAL ACTION BUTTONS */}
          <div className="modal-actions-right mt-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingBannerId ? 'Update Banner' : 'Publish Banner'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Banners;
