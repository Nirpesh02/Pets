import Order from '../models/Order.js';
import Product from '../models/Product.js';
import PetProfile from '../models/PetProfile.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper to compute expiry info
const computeExpiryInfo = (expiryDate) => {
  if (!expiryDate) return { status: 'unknown', label: 'No Expiry', color: 'neutral', daysLeft: 999 };
  const today = new Date();
  const diffTime = new Date(expiryDate) - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'expired', label: `Expired (${Math.abs(daysLeft)}d ago)`, color: 'rose', daysLeft, isExpired: true };
  }
  if (daysLeft <= 30) {
    return { status: 'expiring_soon', label: `Expiring soon (${daysLeft}d left)`, color: 'amber', daysLeft, isExpired: false };
  }
  if (daysLeft <= 90) {
    return { status: 'moderate', label: `${daysLeft} days freshness left`, color: 'sky', daysLeft, isExpired: false };
  }
  return { status: 'fresh', label: `Guaranteed Fresh (${daysLeft}d left)`, color: 'emerald', daysLeft, isExpired: false };
};

// @desc    Get executive dashboard metrics
// @route   GET /api/v1/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [orders, products, pets, customers] = await Promise.all([
      Order.find().sort('-createdAt'),
      Product.find(),
      PetProfile.find(),
      User.find({ role: 'customer' }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

    const lowStockProducts = products.filter((p) => (p.stockCount ?? 0) <= 5);

    const expiringProducts = products.filter((p) => {
      if (!p.expiryDate) return false;
      const info = computeExpiryInfo(p.expiryDate);
      return info.daysLeft <= 60;
    });

    const salesTrend = [
      { day: 'Sun', sales: 12500, orders: 4 },
      { day: 'Mon', sales: 19800, orders: 6 },
      { day: 'Tue', sales: 14200, orders: 5 },
      { day: 'Wed', sales: 26500, orders: 8 },
      { day: 'Thu', sales: 22000, orders: 7 },
      { day: 'Fri', sales: 34500, orders: 11 },
      { day: 'Sat', sales: 41200, orders: 14 },
    ];

    return sendSuccess(
      res,
      {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount,
        lowStockCount: lowStockProducts.length,
        expiringCount: expiringProducts.length,
        activePetsCount: pets.length,
        totalCustomersCount: customers.length,
        recentOrders: orders.slice(0, 5),
        lowStockProducts: lowStockProducts.slice(0, 5),
        expiringProducts: expiringProducts.slice(0, 5),
        salesTrend,
      },
      'Dashboard stats fetched'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory & batch expiry report
// @route   GET /api/v1/admin/inventory/warnings
export const getInventoryWarnings = async (req, res, next) => {
  try {
    const products = await Product.find().sort('stockCount');
    const warnings = products.map((prod) => {
      const expiryInfo = computeExpiryInfo(prod.expiryDate);
      const isLowStock = (prod.stockCount ?? 0) <= 5;
      return {
        ...prod.toObject(),
        expiryInfo,
        isLowStock,
        needsAttention: isLowStock || expiryInfo.daysLeft <= 60,
      };
    });

    return sendSuccess(res, { warnings }, 'Inventory report fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Customers & Hired Admins) with stats
// @route   GET /api/v1/admin/customers
export const getCustomers = async (req, res, next) => {
  try {
    const allUsers = await User.find().sort('-createdAt');
    const orders = await Order.find();
    const pets = await PetProfile.find();

    const userList = allUsers.map((u) => {
      const custOrders = orders.filter((o) => String(o.user) === String(u._id));
      const custPets = pets.filter((p) => String(p.user) === String(u._id));
      const totalSpent = custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const isSuper = Boolean(u.isSuperAdmin || u.email === 'admin@pawnepal.com');

      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isSuperAdmin: isSuper,
        isBlocked: Boolean(u.isBlocked),
        avatar: u.avatar,
        address: `${u.address?.street || ''}, ${u.address?.city || 'Kathmandu'}`,
        totalOrders: custOrders.length,
        totalSpent,
        registeredPetsCount: custPets.length,
        createdAt: u.createdAt?.toISOString().split('T')[0] || '2026-01-01',
      };
    });

    return sendSuccess(res, { customers: userList }, 'Customers fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock a customer or hired admin
// @route   PATCH /api/v1/admin/customers/:id/block
export const toggleBlockCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Super Admin cannot be blocked
    if (user.isSuperAdmin || user.email === 'admin@pawnepal.com') {
      return sendError(res, 'Super Administrator cannot be blocked.', 400);
    }

    // Admin cannot block themselves
    if (req.user && String(user._id) === String(req.user._id)) {
      return sendError(res, 'You cannot block your own account.', 400);
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return sendSuccess(
      res,
      { isBlocked: user.isBlocked, user },
      `Account ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer or hired admin account
// @route   DELETE /api/v1/admin/customers/:id
export const deleteCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Super Admin cannot be deleted
    if (user.isSuperAdmin || user.email === 'admin@pawnepal.com') {
      return sendError(res, 'Super Administrator cannot be deleted.', 400);
    }

    // Admin cannot delete themselves
    if (req.user && String(user._id) === String(req.user._id)) {
      return sendError(res, 'You cannot delete your own account.', 400);
    }

    // Clean up associated pets so data stays tidy
    await PetProfile.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(res, {}, `Account ${user.name} deleted successfully.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (Hire as Admin or Revoke back to Customer)
// @route   PATCH /api/v1/admin/customers/:id/role
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role. Must be "customer" or "admin"', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Protect Super Admin
    if (user.isSuperAdmin || user.email === 'admin@pawnepal.com') {
      return sendError(res, 'Cannot change the role of Super Administrator.', 400);
    }

    // Prevent changing own role
    if (req.user && String(user._id) === String(req.user._id)) {
      return sendError(res, 'You cannot change your own role.', 400);
    }

    user.role = role;
    await user.save();

    const roleTitle = role === 'admin' ? 'Store Administrator (Hired)' : 'Customer';
    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isSuperAdmin: false,
          isBlocked: user.isBlocked,
        },
      },
      `User ${user.name} has been ${role === 'admin' ? 'hired as Store Administrator' : 'demoted back to Customer'}.`
    );
  } catch (error) {
    next(error);
  }
};
