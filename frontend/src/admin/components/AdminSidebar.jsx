import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  AlertTriangle,
  Image,
  Users,
  Store,
  PawPrint,
  LogOut,
  X,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && <div className="admin-sidebar-backdrop" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand-link">
            <div className="admin-logo-icon">
              <PawPrint size={22} className="text-white" />
            </div>
            <div>
              <div className="admin-brand-name">PawNepal</div>
              <div className="admin-brand-badge">ADMIN CONSOLE</div>
            </div>
          </Link>
          <button type="button" className="admin-sidebar-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-nav-sections">
          <div className="admin-nav-group-title">MAIN NAVIGATION</div>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Package size={18} />
            <span>Products & Batches</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <ShoppingBag size={18} />
            <span>Orders & Invoices</span>
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <AlertTriangle size={18} />
            <span>Inventory & Expiry</span>
          </NavLink>

          <div className="admin-nav-group-title">CONTENT & USERS</div>

          <NavLink
            to="/admin/banners"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Image size={18} />
            <span>Promo Banners</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Users size={18} />
            <span>Customers & Pets</span>
          </NavLink>

          <NavLink
            to="/admin/coupons"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Gift size={18} />
            <span>Exclusive Coupons</span>
          </NavLink>
        </div>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-return-store-link">
            <Store size={18} />
            <span>View Public Store</span>
          </Link>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleAdminLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
