import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { DELIVERY_ZONES } from '../utils/constants';
import { useToast } from './ToastContext';
import { subscriberApi } from '../api/subscriberApi';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('pawnepal_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [shippingZoneId, setShippingZoneId] = useState('valley_inside');
  const [promoCode, setPromoCode] = useState(() => {
    try {
      return sessionStorage.getItem('pawnepal_promo_code') || '';
    } catch {
      return '';
    }
  });
  const [discountPercent, setDiscountPercent] = useState(() => {
    try {
      return Number(sessionStorage.getItem('pawnepal_discount_percent')) || 0;
    } catch {
      return 0;
    }
  });
  const [couponExpiresAt, setCouponExpiresAt] = useState(() => {
    try {
      return sessionStorage.getItem('pawnepal_coupon_expires_at') || null;
    } catch {
      return null;
    }
  });

  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('pawnepal_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Sync promo code details to session storage
  useEffect(() => {
    try {
      if (promoCode) {
        sessionStorage.setItem('pawnepal_promo_code', promoCode);
        sessionStorage.setItem('pawnepal_discount_percent', String(discountPercent));
        if (couponExpiresAt) {
          sessionStorage.setItem('pawnepal_coupon_expires_at', couponExpiresAt);
        }
      } else {
        sessionStorage.removeItem('pawnepal_promo_code');
        sessionStorage.removeItem('pawnepal_discount_percent');
        sessionStorage.removeItem('pawnepal_coupon_expires_at');
      }
    } catch {}
  }, [promoCode, discountPercent, couponExpiresAt]);

  // REAL-TIME AUTO REMOVAL OF EXPIRED COUPON
  useEffect(() => {
    if (!promoCode) return;

    const checkLiveExpiry = () => {
      if (!couponExpiresAt) return;
      const now = Date.now();
      const expTime = new Date(couponExpiresAt).getTime();

      if (now >= expTime) {
        const expired = promoCode;
        setPromoCode('');
        setDiscountPercent(0);
        setCouponExpiresAt(null);
        try {
          sessionStorage.removeItem('pawnepal_promo_code');
          sessionStorage.removeItem('pawnepal_discount_percent');
          sessionStorage.removeItem('pawnepal_coupon_expires_at');
        } catch {}
        toast.error(`⚠️ Time expired! Coupon "${expired}" is no longer valid and discount was removed.`);
      }
    };

    checkLiveExpiry();
    const interval = setInterval(checkLiveExpiry, 1000); // Check every second

    const handleExpiredEvent = (e) => {
      const code = e.detail?.couponCode;
      if (!code || code === promoCode) {
        setPromoCode('');
        setDiscountPercent(0);
        setCouponExpiresAt(null);
        try {
          sessionStorage.removeItem('pawnepal_promo_code');
          sessionStorage.removeItem('pawnepal_discount_percent');
          sessionStorage.removeItem('pawnepal_coupon_expires_at');
        } catch {}
        toast.error('⚠️ Coupon has expired and discount has been removed.');
      }
    };

    window.addEventListener('coupon:expired', handleExpiredEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('coupon:expired', handleExpiredEvent);
    };
  }, [promoCode, couponExpiresAt]);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    const variantName = selectedVariant ? selectedVariant.weight : (product.variants?.[0]?.weight || 'Standard');
    const price = selectedVariant ? selectedVariant.price : product.price;
    const cartItemId = `${product._id || product.id}-${variantName}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product._id || product.id,
            name: product.name,
            variant: variantName,
            price: price,
            quantity: quantity,
            image: product.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          },
        ];
      }
    });

    toast.success(`Added ${product.name} (${variantName}) to cart!`);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed from cart.');
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setCouponExpiresAt(null);
    try {
      sessionStorage.removeItem('pawnepal_promo_code');
      sessionStorage.removeItem('pawnepal_discount_percent');
      sessionStorage.removeItem('pawnepal_coupon_expires_at');
    } catch {}
  };

  const applyPromoCode = async (code, customEmail = '') => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return false;

    // Check user email from session storage, custom parameter, or newsletter localStorage
    let emailToVerify = customEmail;
    if (!emailToVerify) {
      try {
        const storedUser = sessionStorage.getItem('pawnepal_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          emailToVerify = parsed.email || '';
        }
      } catch {}
    }
    if (!emailToVerify) {
      emailToVerify = localStorage.getItem('pawnepal_newsletter_email') || '';
    }

    if (!emailToVerify) {
      toast.error('Please join this related email and only accept for this coupan');
      return false;
    }

    try {
      const res = await subscriberApi.validateCoupon(clean, emailToVerify);
      const discount = res.data?.discountPercent || res.discountPercent || 15;
      const finalCode = res.data?.couponCode || res.couponCode || clean;
      const expiresAt = res.data?.expiresAt || res.expiresAt || null;

      // Double check if already expired
      if (expiresAt && Date.now() >= new Date(expiresAt).getTime()) {
        toast.error(`⚠️ Coupon "${finalCode}" has expired and cannot be applied.`);
        return false;
      }

      setPromoCode(finalCode);
      setDiscountPercent(discount);
      setCouponExpiresAt(expiresAt);

      toast.success(`Coupon code ${finalCode} applied: ${discount}% discount!`);
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Please join this related email and only accept for this coupan';
      toast.error(msg);
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
    setCouponExpiresAt(null);
    try {
      sessionStorage.removeItem('pawnepal_promo_code');
      sessionStorage.removeItem('pawnepal_discount_percent');
      sessionStorage.removeItem('pawnepal_coupon_expires_at');
    } catch {}
    toast.info('Promo code removed.');
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const activeZone = useMemo(() => {
    return DELIVERY_ZONES.find((z) => z.id === shippingZoneId) || DELIVERY_ZONES[0];
  }, [shippingZoneId]);

  const shippingFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    if (subtotal >= 6000 && shippingZoneId === 'valley_inside') return 0;
    return activeZone.cost;
  }, [cartItems.length, subtotal, shippingZoneId, activeZone]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal + shippingFee - discountAmount);
  }, [subtotal, shippingFee, discountAmount]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        shippingZoneId,
        setShippingZoneId,
        activeZone,
        shippingFee,
        promoCode,
        discountPercent,
        discountAmount,
        couponExpiresAt,
        applyPromoCode,
        removePromoCode,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const useCartContext = useCart;

export default CartContext;
