import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  PawPrint,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Sliders,
  Menu,
  X,
  Plus,
  Compass,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { usePet } from '../../hooks/usePet';
import NotificationBell from '../common/NotificationBell';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { pets, activePet, setActivePet } = usePet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPetMenuOpen, setIsPetMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="site-header">
      {/* Top Announcement Bar */}
      <div className="top-banner-bar">
        <div className="container top-banner-content">
          <div className="top-banner-left">
            <span className="live-pulse" />
            <span>Kathmandu Valley Same-Day Delivery Inside Ring Road (eSewa & COD Available)</span>
          </div>
          <div className="top-banner-right">
            <span>📞 Hotline: +977 9816988657</span>
            <span className='live-pulse' style={{ opacity: 1, margin: '0 8px' }}></span>
            <span>🐾 Vet-Approved Care</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container main-navbar">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="logo-icon-box">
            <PawPrint size={24} className="text-white" />
          </div>
          <div className="logo-text-box">
            <span className="brand-name">
              Paw<span className="text-primary">Nepal</span>
            </span>
            <span className="brand-tagline">Pet Nutrition & Care</span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search dry food, treats, tick sprays, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
            >
              ×
            </button>
          )}
        </form>

        {/* Right Action Icons */}
        <div className="nav-actions">
          {/* Active Pet Selector Dropdown */}
          <div className="nav-pet-dropdown-wrap">
            <button
              type="button"
              className="active-pet-btn"
              onClick={() => {
                setIsPetMenuOpen(!isPetMenuOpen);
                setIsUserMenuOpen(false);
              }}
            >
              <div className="pet-avatar-mini">
                {activePet?.avatar ? (
                  <img src={activePet.avatar} alt={activePet.name} />
                ) : (
                  <span>🐾</span>
                )}
              </div>
              <div className="pet-btn-details">
                <span className="pet-label-sub">Active Pet</span>
                <span className="pet-btn-name">
                  {activePet ? activePet.name : 'Choose Pet'}
                </span>
              </div>
              <ChevronDown size={14} className="dropdown-arrow" />
            </button>

            {isPetMenuOpen && (
              <div className="pet-dropdown-menu">
                <div className="dropdown-section-title">My Registered Pets</div>
                {pets && pets.length > 0 ? (
                  pets.map((p) => {
                    const petKey = p._id || p.id;
                    const isSelected = petKey === (activePet?._id || activePet?.id);
                    return (
                      <button
                        key={petKey}
                        type="button"
                        className={`pet-menu-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setActivePet(petKey);
                          setIsPetMenuOpen(false);
                        }}
                      >
                        <img src={p.avatar} alt={p.name} className="pet-menu-avatar" />
                        <div className="pet-menu-info">
                          <div className="pet-menu-name">
                            {p.name} <span className="species-icon">{p.species === 'cat' ? '🐈' : '🐕'}</span>
                          </div>
                          <div className="pet-menu-breed">{p.breed} • {p.weightKg} kg</div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    No pets registered yet
                  </div>
                )}
                <Link
                  to="/pet-profile"
                  className="pet-add-new-link"
                  onClick={() => setIsPetMenuOpen(false)}
                >
                  <Plus size={15} /> Add New Pet Profile
                </Link>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Cart Icon with Counter */}
          <Link to="/cart" className="nav-cart-btn" aria-label="Cart">
            <ShoppingCart size={22} />
            {totalItemCount > 0 && <span className="cart-badge-count">{totalItemCount}</span>}
          </Link>

          {/* User Account / Admin Menu */}
          <div className="nav-user-dropdown-wrap">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="user-profile-btn"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsPetMenuOpen(false);
                  }}
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.name}
                    className="user-avatar-mini"
                  />
                  <span className="user-name-display">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="dropdown-arrow" />
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-menu-header">
                      <div className="user-menu-name">{user?.name}</div>
                      <div className="user-menu-role">
                        {isAdmin ? '👑 Store Administrator' : '🐾 Pet Parent'}
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-link admin-highlight"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShieldCheck size={16} /> Admin Control Panel
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      className="dropdown-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Sliders size={16} /> My Orders & Dashboard
                    </Link>

                    <Link
                      to="/dashboard?tab=profile"
                      className="dropdown-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <KeyRound size={16} /> Edit Profile & Password
                    </Link>

                    <Link
                      to="/pet-profile"
                      className="dropdown-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <PawPrint size={16} /> Manage Pet Profiles
                    </Link>

                    <button
                      type="button"
                      className="dropdown-link text-danger"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="auth-action-buttons">
                <Link to="/login" className="app-btn btn-ghost btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="app-btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <nav className="secondary-nav">
        <div className="container nav-links-row">
          <Link
            to="/shop"
            className={`nav-category-link ${location.pathname === '/shop' && !location.search ? 'active' : ''}`}
          >
            <Compass size={16} /> All Products
          </Link>
          <Link
            to="/shop?petType=dog"
            className={`nav-category-link ${location.search.includes('petType=dog') ? 'active' : ''}`}
          >
            🐕 Dogs
          </Link>
          <Link
            to="/shop?petType=cat"
            className={`nav-category-link ${location.search.includes('petType=cat') ? 'active' : ''}`}
          >
            🐈 Cats
          </Link>
          <Link
            to="/shop?category=food"
            className={`nav-category-link ${location.search.includes('category=food') ? 'active' : ''}`}
          >
            🍖 Food & Nutrition
          </Link>
          <Link
            to="/shop?category=health"
            className={`nav-category-link ${location.search.includes('category=health') ? 'active' : ''}`}
          >
            💊 Health & Vet Care
          </Link>
          <Link
            to="/shop?category=grooming"
            className={`nav-category-link ${location.search.includes('category=grooming') ? 'active' : ''}`}
          >
            🛁 Grooming
          </Link>
          <Link
            to="/shop?category=toys"
            className={`nav-category-link ${location.search.includes('category=toys') ? 'active' : ''}`}
          >
            🎾 Toys & Chews
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-category-link admin-pill">
              🛡️ Admin Panel
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="mobile-brand-title">Menu</span>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-links-list">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>
                Shop Products
              </Link>
              <Link to="/shop?petType=dog" onClick={() => setIsMobileMenuOpen(false)}>
                Dog Essentials
              </Link>
              <Link to="/shop?petType=cat" onClick={() => setIsMobileMenuOpen(false)}>
                Cat Essentials
              </Link>
              <Link to="/pet-profile" onClick={() => setIsMobileMenuOpen(false)}>
                My Pets & Dietary Needs
              </Link>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                Track Orders & History
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  Admin Management
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
