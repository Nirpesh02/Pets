import Banner from '../models/Banner.js';
import User from '../models/User.js';
import Subscriber from '../models/Subscriber.js';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { SEED_DOG_BANNER_IMAGES } from '../constants/dogBannerPresets.js';

// @desc    Get curated dog images for banner selection
// @route   GET /api/v1/banners/dog-images
export const getDogImages = async (req, res, next) => {
  try {
    return sendSuccess(res, { dogImages: SEED_DOG_BANNER_IMAGES }, 'Dog banner images fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Get active banners for homepage (Exclusive flash banner shown ONLY to targeted customer)
// @route   GET /api/v1/banners
export const getBanners = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Automatically deactivate expired exclusive flash banners
    await Banner.updateMany(
      { isExclusive: true, expiresAt: { $lte: now }, active: true },
      { $set: { active: false } }
    );

    // 2. Identify current customer email from query param or Authorization header
    let userEmail = (req.query.email || '').trim().toLowerCase();

    if (!userEmail && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
          const u = await User.findById(decoded.id);
          if (u?.email) userEmail = u.email.trim().toLowerCase();
        }
      } catch {}
    }

    // 3. Check if an active exclusive coupon banner exists specifically for THIS customer
    let targetedExclusiveBanner = null;

    if (userEmail) {
      const activeExclusiveBanners = await Banner.find({
        isExclusive: true,
        active: true,
        expiresAt: { $gt: now },
      }).sort('-createdAt');

      for (const b of activeExclusiveBanners) {
        // Direct match on targetEmail
        if (b.targetEmail && b.targetEmail.toLowerCase() === userEmail) {
          targetedExclusiveBanner = b;
          break;
        }
        // Match in targetEmails list
        if (
          Array.isArray(b.targetEmails) &&
          b.targetEmails.map((e) => e.toLowerCase()).includes(userEmail)
        ) {
          targetedExclusiveBanner = b;
          break;
        }
        // Match via Subscriber collection by couponCode (backward compatibility)
        if (b.couponCode) {
          const sub = await Subscriber.findOne({
            couponCode: b.couponCode.trim().toUpperCase(),
            email: userEmail,
            status: 'approved',
          });
          if (sub) {
            targetedExclusiveBanner = b;
            Banner.findByIdAndUpdate(b._id, { $set: { targetEmail: userEmail } }).catch(() => {});
            break;
          }
        }
      }
    }

    // If an exclusive banner is active FOR THIS TARGET CUSTOMER, show their exclusive banner
    if (targetedExclusiveBanner) {
      return sendSuccess(
        res,
        {
          banners: [targetedExclusiveBanner],
          isExclusiveActive: true,
          exclusiveBanner: targetedExclusiveBanner,
        },
        'Targeted exclusive flash banner active for customer'
      );
    }

    // 4. Otherwise (for all other customers or non-logged-in visitors), return standard active banners!
    const banners = await Banner.find({
      active: true,
      isExclusive: { $ne: true },
    }).sort('displayOrder');

    return sendSuccess(
      res,
      {
        banners,
        isExclusiveActive: false,
      },
      'Standard banners fetched'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/v1/banners/all
export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('-createdAt');
    return sendSuccess(res, { banners }, 'All banners fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Create banner (Admin)
// @route   POST /api/v1/banners
export const createBanner = async (req, res, next) => {
  try {
    if (req.body.isExclusive) {
      const target = (req.body.targetEmail || '').trim().toLowerCase();
      if (target) {
        // Deactivate older exclusive banners specifically for this customer
        await Banner.updateMany(
          { isExclusive: true, targetEmail: target, active: true },
          { $set: { active: false } }
        );
      }
    }

    const banner = await Banner.create(req.body);
    return sendSuccess(res, { banner }, 'Banner created', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner (Admin)
// @route   PUT /api/v1/banners/:id
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return sendError(res, 'Banner not found', 404);
    }
    return sendSuccess(res, { banner }, 'Banner updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete banner (Admin)
// @route   DELETE /api/v1/banners/:id
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return sendError(res, 'Banner not found', 404);
    }
    return sendSuccess(res, {}, 'Banner deleted');
  } catch (error) {
    next(error);
  }
};
