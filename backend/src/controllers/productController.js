import Product from '../models/Product.js';
import APIFeatures from '../utils/apiFeatures.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get all products with filters, sorting, search, pagination
// @route   GET /api/v1/products
export const getProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .sort()
      .paginate();

    const products = await features.query;
    const totalCount = await Product.countDocuments();

    return sendSuccess(
      res,
      {
        count: products.length,
        total: totalCount,
        products,
      },
      'Products fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, { product }, 'Product fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured & bestseller products
// @route   GET /api/v1/products/featured
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $or: [{ isFeatured: true }, { isBestseller: true }],
    }).limit(12);

    return sendSuccess(res, { products }, 'Featured products fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/v1/products
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return sendSuccess(res, { product }, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/v1/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, { product }, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/v1/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, {}, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};
