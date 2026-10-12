import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    discountPercent: {
      type: Number,
      default: 10,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    validityMinutes: {
      type: Number,
      default: 60,
    },
    adminNote: {
      type: String,
      default: '',
    },
    isReadByUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index email for quick lookup
subscriberSchema.index({ email: 1 });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
