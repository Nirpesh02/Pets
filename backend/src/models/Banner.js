import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide banner title'],
    },
    subtitle: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: 'Special Offer',
    },
    ctaText: {
      type: String,
      default: 'Shop Now',
    },
    ctaLink: {
      type: String,
      default: '/shop',
    },
    image: {
      type: String,
      required: true,
    },
    bgGradient: {
      type: String,
      default: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    },
    active: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
    couponCode: {
      type: String,
      default: null,
    },
    discountPercent: {
      type: Number,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    targetEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    targetEmails: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
