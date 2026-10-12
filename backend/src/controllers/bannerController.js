import Banner from '../models/Banner.js';
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

// @desc    Get all active banners for homepage (Hides normal banners when exclusive flash banner is active)
// @route   GET /api/v1/banners
export const getBanners = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Automatically deactivate expired exclusive flash banners
    await Banner.updateMany(
      { isExclusive: true, expiresAt: { $lte: now }, active: true },
      { $set: { active: false } }
    );

    // 2. Check if an active exclusive coupon banner is active
    const activeExclusiveBanner = await Banner.findOne({
      isExclusive: true,
      active: true,
      expiresAt: { $gt: now },
    }).sort('-createdAt');

    // If an exclusive banner is active, return ONLY that banner!
    if (activeExclusiveBanner) {
      return sendSuccess(
        res,
        {
          banners: [activeExclusiveBanner],
          isExclusiveActive: true,
          exclusiveBanner: activeExclusiveBanner,
        },
        'Exclusive flash banner active'
      );
    }

    // 3. Otherwise return all standard active banners
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
      // Deactivate older exclusive banners so new flash deal takes exclusive priority
      await Banner.updateMany(
        { isExclusive: true, active: true },
        { $set: { active: false } }
      );
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
