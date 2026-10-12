import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  PawPrint,
  User,
  Shield,
  Eye,
  Camera,
  UploadCloud,
  FileText,
  Lock,
  KeyRound,
  Edit3,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import { orderApi } from '../../api/orderApi';
import { formatNPR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

export const UserDashboard = () => {
  const { user, isAdmin, isSuperAdmin, uploadAvatar, updateProfile } = useAuth();
  const { pets } = usePet();
  const location = useLocation();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit Profile & Credentials state
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleOpenEditModal = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordSection(false);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long.');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        toast.error('New password and confirmation password do not match.');
        return;
      }
    }

    try {
      setSavingProfile(true);
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
        },
        currentPassword: profileForm.currentPassword || undefined,
        newPassword: profileForm.newPassword || undefined,
      });
      setIsEditProfileModalOpen(false);
    } catch {
      // Error is handled in toast
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    try {
      setUploadingAvatar(true);
      await uploadAvatar(file);
    } catch {
      // Error toast already fired inside uploadAvatar
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();

    if (location.search.includes('profile') || location.search.includes('settings')) {
      handleOpenEditModal();
    }
  }, [location.search]);

  return (
    <div className="container dashboard-page-root">
      {/* User Overview Profile Card */}
      <div className="dashboard-hero-card">
        <div className="user-hero-info">
          <div className="user-avatar-upload-container" title="Click to upload profile photo">
            <label htmlFor="user-profile-avatar-input" style={{ cursor: 'pointer', display: 'block', position: 'relative' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                alt={user?.name}
                className="user-hero-avatar"
                style={{ opacity: uploadingAvatar ? 0.6 : 1 }}
              />
              <div className="avatar-edit-overlay">
                <Camera size={20} />
                <span>{uploadingAvatar ? 'Uploading...' : 'Change'}</span>
              </div>
              <div className="avatar-camera-floating-btn" title="Upload new photo">
                <Camera size={14} />
              </div>
            </label>
            <input
              id="user-profile-avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarFileSelect}
              disabled={uploadingAvatar}
            />
          </div>

          <div>
            <div className="user-hero-greeting">Welcome back,</div>
            <div
              className="user-hero-clickable-info"
              onClick={handleOpenEditModal}
              title="Click here to change email, password, and personal details"
            >
              <h1 className="user-hero-name">
                {user?.name || 'Pet Parent'} <Edit3 size={16} className="inline-edit-icon" />
              </h1>
              <p className="user-hero-email">
                {user?.email} • {user?.phone || '+977 9841234567'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <div className="user-hero-role-badge">
                {isSuperAdmin
                  ? '👑 Main Super Administrator'
                  : isAdmin
                  ? '🛡️ Store Administrator'
                  : '🐾 Registered Pet Parent'}
              </div>

              <button
                type="button"
                className="btn-edit-credentials"
                onClick={handleOpenEditModal}
                title="Change email, password, and contact details"
              >
                <KeyRound size={13} /> Change Email / Password
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-quick-stats">
          <div className="hero-stat-box">
            <span className="hero-stat-val">{orders.length}</span>
            <span className="hero-stat-label">Total Orders</span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-val">{pets.length}</span>
            <span className="hero-stat-label">Registered Pets</span>
          </div>
        </div>
      </div>

      {/* Main Tabs / Sections Grid */}
      <div className="dashboard-grid-layout">
        {/* Left Column: Order History & Tracking */}
        <div className="dashboard-main-col">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">My Orders & Live Tracking</h3>
              <p className="dashboard-card-sub">Real-time status updates from our Kathmandu fulfillment center</p>
            </div>

            {loading ? (
              <Loader size="md" text="Loading order history..." />
            ) : orders.length === 0 ? (
              <div className="no-orders-box">
                <ShoppingBag size={40} className="text-muted" />
                <p>You haven't placed any orders yet.</p>
                <Link to="/shop">
                  <Button variant="primary">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="user-orders-list">
                {orders.map((ord) => (
                  <div key={ord.id} className="user-order-card">
                    <div className="user-order-card-top">
                      <div>
                        <div className="user-order-id">
                          Order <strong>#{ord.id}</strong>
                        </div>
                        <div className="user-order-date">Placed on {formatDate(ord.createdAt)}</div>
                      </div>

                      <Badge
                        variant={
                          ord.status === 'delivered'
                            ? 'emerald'
                            : ord.status === 'shipped'
                            ? 'indigo'
                            : ord.status === 'confirmed'
                            ? 'blue'
                            : 'amber'
                        }
                        dot
                      >
                        {ord.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Progress Tracker Steps */}
                    <div className="order-tracker-track">
                      {['pending', 'confirmed', 'shipped', 'delivered'].map((step, idx) => {
                        const stepOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
                        const currentIdx = stepOrder.indexOf(ord.status);
                        const isCompleted = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div
                            key={step}
                            className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <div className="step-circle">{isCompleted ? '✓' : idx + 1}</div>
                            <span className="step-name">{step}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Items List */}
                    <div className="user-order-items">
                      {ord.items?.map((it, i) => (
                        <div key={i} className="user-order-item-line">
                          <img src={it.image} alt={it.name} className="user-order-thumb" />
                          <div className="user-order-item-desc">
                            <span className="user-order-item-name">{it.name}</span>
                            <span className="user-order-item-variant">
                              {it.variant} × {it.quantity}
                            </span>
                          </div>
                          <span className="user-order-item-price">
                            {formatNPR(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="user-order-footer">
                      <div className="order-delivery-tag">
                        <MapPin size={13} className="inline-icon" /> {ord.deliveryZone}
                        {ord.trackingNumber && (
                          <span className="tracking-code"> • Waybill: {ord.trackingNumber}</span>
                        )}
                      </div>

                      <div className="order-footer-right">
                        <div className="user-order-total">
                          Total: <strong>{formatNPR(ord.totalAmount)}</strong>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedOrder(ord)}
                        >
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pets & Saved Addresses */}
        <div className="dashboard-side-col">
          {/* Registered Pets Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header flex-between">
              <h3 className="dashboard-card-title">My Registered Pets</h3>
              <Link to="/pet-profile" className="view-more-link">
                Manage
              </Link>
            </div>

            <div className="dashboard-pets-list">
              {pets && pets.length > 0 ? (
                pets.map((p) => (
                  <div key={p._id || p.id} className="dashboard-pet-item">
                    <img src={p.avatar} alt={p.name} className="dashboard-pet-avatar" />
                    <div className="dashboard-pet-info">
                      <div className="dashboard-pet-name">
                        {p.name} {p.species === 'cat' ? '🐈' : '🐕'}
                      </div>
                      <div className="dashboard-pet-breed">
                        {p.breed} • {p.weightKg} kg
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No pets registered yet.{' '}
                  <Link to="/pet-profile" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                    Register a Pet
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="dashboard-card">
            <div className="dashboard-card-header flex-between">
              <h3 className="dashboard-card-title">Default Delivery Address</h3>
              <button
                type="button"
                className="view-more-link"
                onClick={handleOpenEditModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                title="Edit default delivery address"
              >
                Edit Address
              </button>
            </div>

            <div className="saved-address-box">
              <div className="address-name">{user?.name || 'Valued Customer'}</div>
              <div className="address-line">{user?.address?.street || 'Kathmandu Valley'}</div>
              <div className="address-line">{user?.address?.city || 'Bagmati Province, Nepal'}</div>
              <div className="address-phone">Phone: {user?.phone || '+977 98XXXXXXXX'}</div>
              <span className="default-address-pill">Primary Address</span>
            </div>
          </div>

          {/* Admin Console Card (Visible only to authenticated Admin) */}
          {isAdmin && (
            <div className="dashboard-card admin-quick-card">
              <h3 className="dashboard-card-title">Admin Management</h3>
              <p className="dashboard-card-sub">
                Access the inventory controls, customer database, and order dispatch system.
              </p>
              <Link to="/admin">
                <Button variant="primary" fullWidth icon={Shield}>
                  Open Admin Console
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Receipt #${selectedOrder.id}`}
          subtitle={`Placed on ${formatDate(selectedOrder.createdAt)}`}
          size="md"
        >
          <div className="receipt-modal-content">
            <div className="receipt-section">
              <h4>Delivery Information</h4>
              <p><strong>Recipient:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              <p><strong>Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
              <p><strong>Destination:</strong> {selectedOrder.deliveryZone}</p>
              <p><strong>Payment Mode:</strong> {selectedOrder.paymentMethod?.toUpperCase()} ({selectedOrder.paymentStatus})</p>
            </div>

            <div className="receipt-section">
              <h4>Ordered Items</h4>
              {selectedOrder.items?.map((it, idx) => (
                <div key={idx} className="receipt-item-line">
                  <span>{it.name} ({it.variant}) × {it.quantity}</span>
                  <strong>{formatNPR(it.price * it.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="receipt-summary-breakdown">
              <div className="receipt-line">
                <span>Subtotal:</span>
                <span>{formatNPR(selectedOrder.subtotal)}</span>
              </div>
              <div className="receipt-line">
                <span>Shipping Fee:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatNPR(selectedOrder.shippingFee)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="receipt-line text-green">
                  <span>Promo Discount:</span>
                  <span>-{formatNPR(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="receipt-line grand">
                <span>Total Amount:</span>
                <span>{formatNPR(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Account Settings & Credentials Modal */}
      {isEditProfileModalOpen && (
        <Modal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          title="Account Settings & Security"
          subtitle="Update your email address, phone, delivery address, or change password"
          size="md"
        >
          <form onSubmit={handleSaveProfile} className="profile-edit-modal-form">
            <div className="modal-form-section">
              <h4 className="modal-section-title">
                <User size={16} /> Personal Information
              </h4>
              <div className="form-grid-2">
                <div className="input-field-group">
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    className="app-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-field-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="text"
                    className="app-input"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label className="input-label">Email Address *</label>
                <div className="input-control-wrapper">
                  <Mail size={16} className="input-prefix-icon" />
                  <input
                    type="email"
                    className="app-input has-prefix"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>
                <span className="input-helper-text">You can change this email. It will be used for future logins.</span>
              </div>

              <div className="form-grid-2">
                <div className="input-field-group">
                  <label className="input-label">Street / Ward</label>
                  <input
                    type="text"
                    className="app-input"
                    value={profileForm.street}
                    onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                    placeholder="e.g. Baluwatar Ward 4"
                  />
                </div>
                <div className="input-field-group">
                  <label className="input-label">City / District</label>
                  <input
                    type="text"
                    className="app-input"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="e.g. Kathmandu"
                  />
                </div>
              </div>
            </div>

            <div className="modal-form-section password-change-section">
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <h4 className="modal-section-title" style={{ margin: 0 }}>
                  <Lock size={16} /> Security & Password
                </h4>
                <button
                  type="button"
                  className="text-toggle-btn"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  {showPasswordSection ? 'Cancel Password Change' : '🔑 Change Password'}
                </button>
              </div>

              {showPasswordSection && (
                <div className="password-fields-box">
                  <div className="input-field-group">
                    <label className="input-label">Current Password</label>
                    <input
                      type="password"
                      className="app-input"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      placeholder="Enter your current password to verify"
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="input-field-group">
                      <label className="input-label">New Password</label>
                      <input
                        type="password"
                        className="app-input"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        placeholder="At least 6 characters"
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="input-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="app-input"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border-light)', marginTop: '16px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileModalOpen(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile & Security'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserDashboard;
