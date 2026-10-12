import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 10 },
  },
  { _id: false }
);

const feedingGuideSchema = new mongoose.Schema(
  {
    petWeight: { type: String, required: true },
    normalActivity: { type: String, required: true },
    highActivity: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand name'],
      trim: true,
    },
    petType: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'fish', 'small_animal', 'all'],
      default: 'dog',
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['food', 'treats', 'toys', 'grooming', 'health', 'accessories'],
      default: 'food',
    },
    lifeStage: {
      type: String,
      enum: ['all', 'puppy_kitten', 'junior', 'adult', 'senior'],
      default: 'adult',
    },
    breedSpecific: {
      type: String,
      default: 'All Breeds',
    },
    price: {
      type: Number,
      required: [true, 'Please specify base price in NPR'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      },
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 1,
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
      ],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 15,
      min: 0,
    },
    batchNumber: {
      type: String,
      default: 'NP-BATCH-GENUINE',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    variants: [variantSchema],
    shortDesc: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    feedingGuide: [feedingGuideSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto compute inStock based on stockCount
productSchema.pre('save', function (next) {
  this.inStock = this.stockCount > 0;
  if (this.originalPrice > this.price && !this.discountPercent) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
