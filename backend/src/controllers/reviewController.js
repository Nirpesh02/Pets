import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Helper to recalculate and update a product's average rating & review count
 */
export const recalculateProductRating = async (productId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const avgRating = Math.round(stats[0].avgRating * 10) / 10;
      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 5.0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error('Error recalculating product rating:', err);
  }
};

/**
 * @desc    Get all reviews for a specific product
 * @route   GET /api/v1/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar email')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let avgRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => {
        const rounded = Math.min(5, Math.max(1, Math.round(curr.rating)));
        if (distribution[rounded] !== undefined) {
          distribution[rounded]++;
        }
        return acc + curr.rating;
      }, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    const formattedReviews = reviews.map((r) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (r.user?.avatar) obj.userAvatar = r.user.avatar;
      if (r.user?.name) obj.userName = r.user.name;
      return obj;
    });

    return sendSuccess(
      res,
      {
        reviews: formattedReviews,
        totalReviews,
        avgRating,
        distribution,
      },
      'Product reviews fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured reviews for client-side homepage ("Loved by 4,000+ Pet Parents")
 * @route   GET /api/v1/reviews/featured
 * @access  Public
 */
export const getFeaturedHomeReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isFeaturedOnHome: true })
      .populate('product', 'name images brand price')
      .populate('user', 'name avatar')
      .sort({ updatedAt: -1 });

    const formattedReviews = reviews.map((r) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (r.user?.avatar) obj.userAvatar = r.user.avatar;
      if (r.user?.name) obj.userName = r.user.name;
      return obj;
    });

    return sendSuccess(
      res,
      {
        reviews: formattedReviews,
        count: formattedReviews.length,
      },
      'Featured client-side reviews fetched'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update a review for a product
 * @route   POST /api/v1/reviews/product/:productId
 * @access  Private (Authenticated Customer)
 */
export const createOrUpdateReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment, petInfo, photos } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return sendError(res, 'Please provide a valid star rating between 1 and 5', 400);
    }

    if (!comment || !comment.trim()) {
      return sendError(res, 'Please write your review comment', 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, user: req.user._id });

    if (review) {
      // Update existing review
      review.rating = Number(rating);
      review.comment = comment.trim();
      if (petInfo !== undefined) review.petInfo = petInfo.trim();
      if (photos) review.photos = photos;
      review.userName = req.user.name;
      review.userAvatar = req.user.avatar || '';
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        product: productId,
        user: req.user._id,
        userName: req.user.name,
        userAvatar: req.user.avatar || '',
        rating: Number(rating),
        comment: comment.trim(),
        petInfo: (petInfo || '').trim(),
        photos: photos || [],
        isFeaturedOnHome: false,
      });
    }

    // Update product overall rating & review count
    await recalculateProductRating(productId);

    return sendSuccess(
      res,
      { review },
      'Thank you! Your review has been saved.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Review author or Admin)
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    // Check permissions
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 'You are not authorized to delete this review', 403);
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    await recalculateProductRating(productId);

    return sendSuccess(res, {}, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for Admin Console with stats and search/filter
 * @route   GET /api/v1/reviews/admin
 * @access  Private (Admin Only)
 */
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { search, rating, status } = req.query;

    const query = {};

    if (rating && Number(rating) > 0) {
      query.rating = Number(rating);
    }

    if (status === 'featured') {
      query.isFeaturedOnHome = true;
    } else if (status === 'not_featured') {
      query.isFeaturedOnHome = false;
    }

    let reviews = await Review.find(query)
      .populate('product', 'name images brand price')
      .populate('user', 'name email avatar phone')
      .sort({ createdAt: -1 });

    // Format reviews to ensure they always reflect the user's latest avatar and name
    reviews = reviews.map((r) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (r.user?.avatar) obj.userAvatar = r.user.avatar;
      if (r.user?.name) obj.userName = r.user.name;
      return obj;
    });

    // Auto-sync in background so Review collection itself stays up-to-date
    for (const r of reviews) {
      if (r.user && (r.user.avatar || r.user.name)) {
        Review.findByIdAndUpdate(r._id, {
          $set: {
            ...(r.user.avatar ? { userAvatar: r.user.avatar } : {}),
            ...(r.user.name ? { userName: r.user.name } : {}),
          },
        }).catch(() => {});
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      reviews = reviews.filter((r) => {
        const userName = (r.userName || '').toLowerCase();
        const userEmail = (r.user?.email || '').toLowerCase();
        const productName = (r.product?.name || '').toLowerCase();
        const comment = (r.comment || '').toLowerCase();
        const petInfo = (r.petInfo || '').toLowerCase();
        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          productName.includes(q) ||
          comment.includes(q) ||
          petInfo.includes(q)
        );
      });
    }

    // Compute admin summary statistics
    const allReviews = await Review.find();
    const totalReviews = allReviews.length;
    const featuredCount = allReviews.filter((r) => r.isFeaturedOnHome).length;
    const fiveStarCount = allReviews.filter((r) => r.rating === 5).length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
          )
        : 5.0;

    return sendSuccess(
      res,
      {
        reviews,
        stats: {
          totalReviews,
          featuredCount,
          fiveStarCount,
          avgRating,
        },
      },
      'All reviews retrieved for admin'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle "Add to client side" / "isFeaturedOnHome"
 * @route   PATCH /api/v1/reviews/:id/toggle-featured
 * @access  Private (Admin Only)
 */
export const toggleFeaturedReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('product', 'name images brand price')
      .populate('user', 'name email avatar');

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    // Toggle featured state or set explicit if passed
    if (typeof req.body.isFeaturedOnHome === 'boolean') {
      review.isFeaturedOnHome = req.body.isFeaturedOnHome;
    } else {
      review.isFeaturedOnHome = !review.isFeaturedOnHome;
    }

    await review.save();

    const message = review.isFeaturedOnHome
      ? 'Review successfully added to client side homepage! ⭐'
      : 'Review removed from client side homepage.';

    return sendSuccess(
      res,
      {
        review,
        isFeaturedOnHome: review.isFeaturedOnHome,
      },
      message
    );
  } catch (error) {
    next(error);
  }
};
