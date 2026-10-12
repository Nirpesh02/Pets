import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ShoppingCart, PawPrint, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export const MobileBottomNav = () => {
  const { totalItemCount } = useCart();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Shop</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="bottom-cart-wrapper">
          <ShoppingCart size={20} />
          {totalItemCount > 0 && <span className="bottom-cart-count">{totalItemCount}</span>}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink
        to="/pet-profile"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <PawPrint size={20} />
        <span>My Pets</span>
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Account</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
