import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '+977 9841000000',
      address: address || { street: 'Kathmandu', city: 'Kathmandu' },
      role: role === 'admin' ? 'admin' : 'customer',
    });

    const token = user.getSignedJwtToken();

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          address: user.address,
          isSuperAdmin: Boolean(user.isSuperAdmin || user.email === 'admin@pawnepal.com'),
        },
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get JWT token
// @route   POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide an email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.isBlocked) {
      return sendError(res, 'Sorry, you are blocked by admin.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isSuper = Boolean(user.isSuperAdmin || user.email === 'admin@pawnepal.com');
    // Ensure isSuperAdmin flag is persisted for initial super admin
    if (user.email === 'admin@pawnepal.com' && !user.isSuperAdmin) {
      user.isSuperAdmin = true;
      await user.save();
    }

    const token = user.getSignedJwtToken();

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          address: user.address,
          isSuperAdmin: isSuper,
        },
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user
// @route   GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const isSuper = Boolean(user.isSuperAdmin || user.email === 'admin@pawnepal.com');
    return sendSuccess(
      res,
      {
        user: {
          ...user.toObject(),
          isSuperAdmin: isSuper,
        },
      },
      'User profile retrieved'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & credentials (email, password, phone, address, name)
// @route   PUT /api/v1/auth/me
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Email change verification
    if (email && email.toLowerCase() !== user.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 'Please provide a valid email address.', 400);
      }
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return sendError(res, 'This email is already in use by another account.', 400);
      }
      user.email = email.toLowerCase();
    }

    // Password change verification
    if (newPassword) {
      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters long.', 400);
      }
      if (currentPassword) {
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return sendError(res, 'Current password is incorrect.', 400);
        }
      }
      user.password = newPassword;
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (avatar) user.avatar = avatar;
    if (address) {
      user.address = {
        street: address.street ?? user.address?.street ?? 'Kathmandu',
        city: address.city ?? user.address?.city ?? 'Kathmandu',
        landmark: address.landmark ?? user.address?.landmark ?? '',
      };
    }

    await user.save();

    const isSuper = Boolean(user.isSuperAdmin || user.email === 'admin@pawnepal.com');
    const token = user.getSignedJwtToken();

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          address: user.address,
          isSuperAdmin: isSuper,
        },
      },
      'Profile and credentials updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar image for logged-in user
// @route   POST /api/v1/auth/avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please provide an image file to upload.', 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    const isSuper = Boolean(user.isSuperAdmin || user.email === 'admin@pawnepal.com');

    return sendSuccess(
      res,
      {
        avatar: avatarUrl,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          address: user.address,
          isSuperAdmin: isSuper,
        },
      },
      'Profile picture uploaded successfully'
    );
  } catch (error) {
    next(error);
  }
};
