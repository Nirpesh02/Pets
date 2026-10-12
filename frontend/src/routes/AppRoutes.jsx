import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import AdminLayout from '../admin/components/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public & Customer Views
import Home from '../views/Home/Home';
import Shop from '../views/Shop/Shop';
import ProductDetail from '../views/ProductDetail/ProductDetail';
import Cart from '../views/Cart/Cart';
import Checkout from '../views/Checkout/Checkout';
import PetProfile from '../views/PetProfile/PetProfile';
import UserDashboard from '../views/UserDashboard/UserDashboard';
import Login from '../views/Auth/Login';
import Register from '../views/Auth/Register';
import ForgotPassword from '../views/Auth/ForgotPassword';

// Admin Views
import Dashboard from '../admin/pages/Dashboard/Dashboard';
import ProductList from '../admin/pages/Products/ProductList';
import AddEditProduct from '../admin/pages/Products/AddEditProduct';
import OrderList from '../admin/pages/Orders/OrderList';
import OrderDetail from '../admin/pages/Orders/OrderDetail';
import Inventory from '../admin/pages/Inventory/Inventory';
import Banners from '../admin/pages/Banners/Banners';
import Customers from '../admin/pages/Customers/Customers';
import ExclusiveCoupons from '../admin/pages/Coupons/ExclusiveCoupons';

// Main Customer Layout Wrapper
const MainStoreLayout = () => {
  return (
    <div className="store-app-container">
      <Navbar />
      <main className="store-main-viewport">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer / Storefront Routes */}
      <Route element={<MainStoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Customer Routes */}
        <Route
          path="/pet-profile"
          element={
            <ProtectedRoute>
              <PetProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Control Panel Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<AddEditProduct />} />
        <Route path="products/edit/:id" element={<AddEditProduct />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="banners" element={<Banners />} />
        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<ExclusiveCoupons />} />
      </Route>

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
