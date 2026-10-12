import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, Bell, Store, Shield, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, isSuperAdmin, uploadAvatar } = useAuth();

  const handleAdminAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadAvatar(file);
    } catch {
      // Handled in toast
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-layout-root">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main-wrapper">
        {/* Admin Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu size={22} />
            </button>
            <div className="admin-portal-badge">
              <Shield size={16} className="text-orange-500" />
              <span>Admin Management Hub</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <Link to="/" className="app-btn btn-outline btn-sm store-peek-btn">
              <Store size={15} /> Storefront
            </Link>

            <div className="admin-user-pill">
              <div className="admin-avatar-wrapper" title="Click camera icon to change profile picture">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name}
                  className="admin-avatar-small"
                  style={{ opacity: uploading ? 0.6 : 1 }}
                />
                <label htmlFor="admin-avatar-file-input" className="admin-avatar-camera-btn" title="Change Admin Photo">
                  <Camera size={10} />
                </label>
                <input
                  id="admin-avatar-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAdminAvatarUpload}
                  disabled={uploading}
                />
              </div>
              <Link to="/dashboard?tab=profile" className="admin-user-info" title="Click to change email, password, and settings" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <span className="admin-user-name">{user?.name || 'Administrator'}</span>
                <span className="admin-user-tag">{isSuperAdmin ? '👑 Super Admin' : 'Store Admin'}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
