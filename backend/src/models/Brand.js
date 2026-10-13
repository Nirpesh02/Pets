import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide brand name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    petTypes: {
      type: [String],
      enum: ['dog', 'cat', 'bird', 'fish', 'small_animal', 'all'],
      default: ['all'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for case-insensitive search
brandSchema.index({ name: 1 }, { collation: { locale: 'en', strength: 2 } });

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
