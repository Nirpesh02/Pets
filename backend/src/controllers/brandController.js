import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Default popular brands widely used in Nepal
export const DEFAULT_NEPALI_BRANDS = [
  // Dogs & Cats
  { name: 'Royal Canin', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Drools', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Pedigree', petTypes: ['dog'], isPopular: true },
  { name: 'Whiskas', petTypes: ['cat'], isPopular: true },
  { name: 'Farmina N&D', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Himalaya Pet Care', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Me-O', petTypes: ['cat'], isPopular: true },
  { name: 'SmartHeart', petTypes: ['dog', 'bird'], isPopular: true },
  { name: 'Purepet', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Purina', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Orijen', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Acana', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'JerHigh', petTypes: ['dog'], isPopular: true },
  { name: 'Gnawlers', petTypes: ['dog'], isPopular: true },
  { name: 'Choostix', petTypes: ['dog'], isPopular: true },
  { name: 'Bio-Groom', petTypes: ['dog', 'cat'], isPopular: true },
  { name: 'Beaphar', petTypes: ['dog', 'cat', 'bird', 'small_animal'], isPopular: true },
  { name: 'Canine Creek', petTypes: ['dog'], isPopular: true },
  { name: 'Taste of the Wild', petTypes: ['dog', 'cat'], isPopular: true },
  // Birds
  { name: 'Vitapol', petTypes: ['bird', 'small_animal'], isPopular: true },
  { name: 'Versele-Laga', petTypes: ['bird', 'small_animal'], isPopular: true },
  { name: 'Petslife', petTypes: ['bird'], isPopular: true },
  { name: 'ZuPreem', petTypes: ['bird'], isPopular: true },
  { name: 'Kaytee', petTypes: ['bird', 'small_animal'], isPopular: true },
  { name: 'Rio', petTypes: ['bird'], isPopular: true },
  { name: 'Harrison\'s', petTypes: ['bird'], isPopular: true },
  // Fish & Aqua
  { name: 'Taiyo', petTypes: ['fish'], isPopular: true },
  { name: 'Optimum', petTypes: ['fish', 'bird'], isPopular: true },
  { name: 'Tetra', petTypes: ['fish'], isPopular: true },
  { name: 'Hikari', petTypes: ['fish'], isPopular: true },
  { name: 'Atman', petTypes: ['fish'], isPopular: true },
  { name: 'SunSun', petTypes: ['fish'], isPopular: true },
  { name: 'Dymax', petTypes: ['fish'], isPopular: true },
  { name: 'Sobo', petTypes: ['fish'], isPopular: true },
  { name: 'Aquadene', petTypes: ['fish'], isPopular: true },
  { name: 'Ocean Free', petTypes: ['fish'], isPopular: true },
  // Small Pets
  { name: 'Oxbow', petTypes: ['small_animal'], isPopular: true },
  { name: 'Little One', petTypes: ['small_animal'], isPopular: true },
  { name: 'Chipsi', petTypes: ['small_animal', 'bird'], isPopular: true },
];

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Get all brands (auto-seed if empty)
// @route   GET /api/v1/brands
export const getBrands = async (req, res, next) => {
  try {
    let brands = await Brand.find().sort({ name: 1 });

    // Auto-seed default brands into MongoDB if empty
    if (brands.length === 0) {
      const seedDocs = DEFAULT_NEPALI_BRANDS.map((b) => ({
        ...b,
        slug: generateSlug(b.name),
        isCustom: false,
      }));
      await Brand.insertMany(seedDocs);
      brands = await Brand.find().sort({ name: 1 });
    }

    return sendSuccess(
      res,
      {
        count: brands.length,
        brands,
      },
      'Brands fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new brand (Admin only)
// @route   POST /api/v1/brands
export const createBrand = async (req, res, next) => {
  try {
    const { name, petTypes = ['all'], description = '', logo = '' } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 'Please provide a valid brand name', 400);
    }

    const trimmedName = name.trim();
    const slug = generateSlug(trimmedName);

    // Check if brand exists (case insensitive)
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existingBrand) {
      return sendSuccess(
        res,
        { brand: existingBrand },
        `Brand "${existingBrand.name}" already exists and is ready to use`,
        200
      );
    }

    const newBrand = await Brand.create({
      name: trimmedName,
      slug,
      petTypes: Array.isArray(petTypes) && petTypes.length > 0 ? petTypes : ['all'],
      description: description.trim(),
      logo: logo.trim(),
      isCustom: true,
      isPopular: false,
    });

    return sendSuccess(
      res,
      { brand: newBrand },
      `Brand "${newBrand.name}" added successfully to database`,
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete brand (Admin only)
// @route   DELETE /api/v1/brands/:id
export const deleteBrand = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    let brand = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      brand = await Brand.findById(identifier);
    }

    if (!brand) {
      const decoded = decodeURIComponent(identifier).trim();
      brand = await Brand.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${decoded}$`, 'i') } },
          { slug: decoded.toLowerCase() },
        ],
      });
    }

    if (!brand) {
      return sendError(res, 'Brand not found in database', 404);
    }

    await Brand.findByIdAndDelete(brand._id);
    return sendSuccess(res, { brand }, `Brand "${brand.name}" removed successfully from database`);
  } catch (error) {
    next(error);
  }
};
