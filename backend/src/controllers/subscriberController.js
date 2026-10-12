import Subscriber from '../models/Subscriber.js';
import User from '../models/User.js';
import Banner from '../models/Banner.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Join newsletter / exclusive offers
// @route   POST /api/v1/subscribers/join
export const joinExclusiveOffers = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address.', 400);
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    // REQUIREMENT 1: Only registered clients can join.
    // If unregistered email: "Email not match, please check and try again later!!"
    const registeredUser = await User.findOne({ email: cleanEmail });
    if (!registeredUser) {
      return sendError(
        res,
        'Email not match, please check and try again later!!',
        400
      );
    }

    let subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (subscriber) {
      if (subscriber.status === 'approved') {
        return sendError(
          res,
          'You are already an approved member! Please check your notification bell for your coupon code.',
          400
        );
      }
      // REQUIREMENT 2: If already joined and pending admin approval:
      if (subscriber.status === 'pending') {
        return sendError(
          res,
          'Your request is currently pending. Please check your notifications to see your offer once approved!',
          400
        );
      }
      // If previously rejected, allow re-submitting
      subscriber.status = 'pending';
      subscriber.user = registeredUser._id;
      await subscriber.save();
      return sendSuccess(
        res,
        { subscriber },
        'Your request to join has been re-submitted for Admin approval.'
      );
    }

    subscriber = await Subscriber.create({
      email: cleanEmail,
      user: registeredUser._id,
      status: 'pending',
    });

    return sendSuccess(
      res,
      { subscriber },
      'Thank you for joining Pet Health Tips & Exclusive Offers! Your request has been sent to Admin for approval.',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscribers (Admin only)
// @route   GET /api/v1/subscribers
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find()
      .populate('user', 'name phone')
      .sort('-createdAt');

    return sendSuccess(res, { subscribers }, 'Subscribers retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Approve subscriber & generate coupon (Admin only)
// @route   PATCH /api/v1/subscribers/:id/approve
export const approveSubscriber = async (req, res, next) => {
  try {
    const { couponCode, discountPercent, validityMinutes, expiresAt } = req.body;
    const subscriber = await Subscriber.findById(req.params.id);

    if (!subscriber) {
      return sendError(res, 'Subscriber not found', 404);
    }

    const previousCode = subscriber.couponCode;

    // Generate coupon code if not provided
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const finalCode = (couponCode || `PAW${discountPercent || 15}-${randomSuffix}`).trim().toUpperCase();
    const finalDiscount = Number(discountPercent) || 15;

    let finalExpiresAt = null;
    let finalValidityMinutes = Number(validityMinutes) || 60;

    if (expiresAt) {
      finalExpiresAt = new Date(expiresAt);
    } else if (validityMinutes) {
      finalExpiresAt = new Date(Date.now() + Number(validityMinutes) * 60 * 1000);
    } else {
      // Default to 60 minutes (1 hour)
      finalExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }

    subscriber.status = 'approved';
    subscriber.couponCode = finalCode;
    subscriber.discountPercent = finalDiscount;
    subscriber.expiresAt = finalExpiresAt;
    subscriber.validityMinutes = finalValidityMinutes;
    subscriber.isReadByUser = false;
    await subscriber.save();

    // Automatically sync active Homepage Exclusive Flash Banner if present
    const isBannerActive = new Date(finalExpiresAt) > new Date();
    await Banner.updateMany(
      {
        $or: [
          ...(previousCode ? [{ couponCode: previousCode }] : []),
          { couponCode: finalCode },
          { isExclusive: true, active: true },
        ],
      },
      {
        $set: {
          couponCode: finalCode,
          discountPercent: finalDiscount,
          expiresAt: finalExpiresAt,
          active: isBannerActive,
          title: `Exclusive Flash Deal: ${finalDiscount}% OFF! 🔥`,
          subtitle: `Use voucher code "${finalCode}" at checkout to get instant ${finalDiscount}% discount on all pet food & grooming essentials!`,
          badge: `⚡ FLASH DEAL • ${finalDiscount}% OFF`,
          ctaText: `Use Code ${finalCode}`,
        },
      }
    );

    return sendSuccess(
      res,
      { subscriber },
      `Subscriber ${subscriber.email} approved! Coupon code ${finalCode} (${finalDiscount}% OFF) valid up to ${new Date(finalExpiresAt).toLocaleTimeString()}.`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk approve multiple subscribers & issue coupon (Admin only)
// @route   POST /api/v1/subscribers/bulk-approve
export const bulkApproveSubscribers = async (req, res, next) => {
  try {
    const { ids, couponCode, discountPercent, validityMinutes, expiresAt } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Please select at least one subscriber', 400);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const finalCode = (couponCode || `PAW${discountPercent || 15}-${randomSuffix}`).trim().toUpperCase();
    const finalDiscount = Number(discountPercent) || 15;

    let finalExpiresAt = null;
    let finalValidityMinutes = Number(validityMinutes) || 60;

    if (expiresAt) {
      finalExpiresAt = new Date(expiresAt);
    } else if (validityMinutes) {
      finalExpiresAt = new Date(Date.now() + Number(validityMinutes) * 60 * 1000);
    } else {
      finalExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }

    await Subscriber.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: 'approved',
          couponCode: finalCode,
          discountPercent: finalDiscount,
          expiresAt: finalExpiresAt,
          validityMinutes: finalValidityMinutes,
          isReadByUser: false,
        },
      }
    );

    // Automatically sync active Homepage Exclusive Flash Banner if present
    const isBannerActive = new Date(finalExpiresAt) > new Date();
    await Banner.updateMany(
      {
        $or: [
          { couponCode: finalCode },
          { isExclusive: true, active: true },
        ],
      },
      {
        $set: {
          couponCode: finalCode,
          discountPercent: finalDiscount,
          expiresAt: finalExpiresAt,
          active: isBannerActive,
          title: `Exclusive Flash Deal: ${finalDiscount}% OFF! 🔥`,
          subtitle: `Use voucher code "${finalCode}" at checkout to get instant ${finalDiscount}% discount on all pet food & grooming essentials!`,
          badge: `⚡ FLASH DEAL • ${finalDiscount}% OFF`,
          ctaText: `Use Code ${finalCode}`,
        },
      }
    );

    const updatedSubscribers = await Subscriber.find({ _id: { $in: ids } });

    return sendSuccess(
      res,
      {
        count: ids.length,
        couponCode: finalCode,
        discountPercent: finalDiscount,
        expiresAt: finalExpiresAt,
        subscribers: updatedSubscribers,
      },
      `Successfully approved and issued coupon ${finalCode} (${finalDiscount}% OFF) to ${ids.length} customers!`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Reject subscriber (Admin only)
// @route   PATCH /api/v1/subscribers/:id/reject
export const rejectSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return sendError(res, 'Subscriber not found', 404);
    }

    if (subscriber.couponCode) {
      await Banner.updateMany(
        { couponCode: subscriber.couponCode, isExclusive: true },
        { $set: { active: false } }
      );
    }

    subscriber.status = 'rejected';
    subscriber.couponCode = '';
    await subscriber.save();

    return sendSuccess(res, { subscriber }, `Subscriber ${subscriber.email} marked as rejected.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscriber (Admin only)
// @route   DELETE /api/v1/subscribers/:id
export const deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return sendError(res, 'Subscriber not found', 404);
    }

    if (subscriber.couponCode) {
      await Banner.updateMany(
        { couponCode: subscriber.couponCode, isExclusive: true },
        { $set: { active: false } }
      );
    }

    await Subscriber.findByIdAndDelete(req.params.id);
    return sendSuccess(res, {}, 'Subscriber record deleted.');
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon code during checkout/cart
// @route   POST /api/v1/subscribers/validate-coupon
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, email } = req.body;

    if (!code) {
      return sendError(res, 'Please provide a coupon code.', 400);
    }

    // USER REQUIREMENT:
    // "yoo join nagari coupan code apply garna namilos...... ani admin lee approved nagari....."
    // "yoo join nagari coupan code apply garo vane.... please join this related email and only accept for this coupan vanos......"
    if (!email) {
      return sendError(
        res,
        'Please join this related email and only accept for this coupan',
        400
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (!subscriber || subscriber.status !== 'approved') {
      return sendError(
        res,
        'Please join this related email and only accept for this coupan',
        400
      );
    }

    const inputCode = code.trim().toUpperCase();

    // Check if coupon has expired
    if (subscriber.expiresAt && new Date() > new Date(subscriber.expiresAt)) {
      const expiryFormatted = new Date(subscriber.expiresAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return sendError(
        res,
        `This coupon code has expired. You could use this code up to ${expiryFormatted}. Please contact admin or request a new offer.`,
        400
      );
    }

    // Check specific coupon code generated for this approved subscriber
    if (subscriber.couponCode && subscriber.couponCode.toUpperCase() === inputCode) {
      return sendSuccess(
        res,
        {
          couponCode: subscriber.couponCode,
          discountPercent: subscriber.discountPercent || 15,
          expiresAt: subscriber.expiresAt,
        },
        `Coupon ${subscriber.couponCode} applied: ${subscriber.discountPercent}% discount!`
      );
    }

    // Also support store general coupons (PAW10, VETPASS) only for approved subscribers
    if (['PAW10', 'PETLOVER10', 'NEPALPETS'].includes(inputCode)) {
      return sendSuccess(
        res,
        {
          couponCode: inputCode,
          discountPercent: 10,
        },
        `Special approved member coupon applied: 10% discount!`
      );
    }

    if (inputCode === 'VETPASS') {
      return sendSuccess(
        res,
        {
          couponCode: inputCode,
          discountPercent: 15,
        },
        `Special Vet Member coupon applied: 15% discount!`
      );
    }

    return sendError(res, 'Invalid coupon code for this email account.', 400);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications (approved coupons, etc.)
// @route   GET /api/v1/subscribers/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return sendSuccess(res, { notifications: [] }, 'No email specified');
    }

    const cleanEmail = email.trim().toLowerCase();
    const subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (!subscriber) {
      return sendSuccess(res, { notifications: [] }, 'No notifications');
    }

    const notifications = [];

    if (subscriber.status === 'approved' && subscriber.couponCode) {
      const isExpired = subscriber.expiresAt ? new Date() > new Date(subscriber.expiresAt) : false;
      const expiryTimeFormatted = subscriber.expiresAt
        ? new Date(subscriber.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

      notifications.push({
        id: subscriber._id,
        type: 'coupon_approved',
        title: isExpired ? 'Coupon Expired ⚠️' : 'Exclusive Offer Approved! 🎉',
        message: subscriber.expiresAt
          ? `Admin has approved your request! You can use this code up to ${expiryTimeFormatted}.`
          : `Admin has approved your request! Here is your exclusive ${subscriber.discountPercent}% OFF coupon code.`,
        couponCode: subscriber.couponCode,
        discountPercent: subscriber.discountPercent,
        expiresAt: subscriber.expiresAt,
        validityMinutes: subscriber.validityMinutes,
        isExpired,
        isRead: Boolean(subscriber.isReadByUser),
        createdAt: subscriber.updatedAt,
      });
    } else if (subscriber.status === 'pending') {
      notifications.push({
        id: subscriber._id,
        type: 'pending_approval',
        title: 'Membership Request Pending ⏳',
        message: 'Your email has been received! Admin approval and your coupon generation are in progress.',
        isRead: true,
        createdAt: subscriber.createdAt,
      });
    }

    return sendSuccess(res, { notifications }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notifications as read
// @route   PATCH /api/v1/subscribers/notifications/read
export const markNotificationsRead = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      await Subscriber.updateOne({ email: cleanEmail }, { $set: { isReadByUser: true } });
    }
    return sendSuccess(res, {}, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};
