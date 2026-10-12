import Banner from '../models/Banner.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all active banners for homepage
// @route   GET /api/v1/banners
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true }).sort('displayOrder');
    return sendSuccess(res, { banners }, 'Banners fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/v1/banners/all
export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('displayOrder');
    return sendSuccess(res, { banners }, 'All banners fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Create banner (Admin)
// @route   POST /api/v1/banners
export const createBanner = async (req, res, next) => {
  try {
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
