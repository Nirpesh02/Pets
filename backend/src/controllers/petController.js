import PetProfile from '../models/PetProfile.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get pets for current user
// @route   GET /api/v1/pets
export const getPets = async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user.id } : {};
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
    const pets = await PetProfile.find(filter).sort('-createdAt');
    return sendSuccess(res, { pets }, 'Pet profiles fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pet
// @route   GET /api/v1/pets/:id
export const getPetById = async (req, res, next) => {
  try {
    const pet = await PetProfile.findById(req.params.id);
    if (!pet) {
      return sendError(res, 'Pet profile not found', 404);
    }
    return sendSuccess(res, { pet }, 'Pet profile fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Create pet profile
// @route   POST /api/v1/pets
export const createPet = async (req, res, next) => {
  try {
    const petData = {
      ...req.body,
      user: req.user ? req.user.id : req.body.userId,
    };
    const pet = await PetProfile.create(petData);
    return sendSuccess(res, { pet }, 'Pet profile created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update pet profile
// @route   PUT /api/v1/pets/:id
export const updatePet = async (req, res, next) => {
  try {
    const pet = await PetProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pet) {
      return sendError(res, 'Pet profile not found', 404);
    }
    return sendSuccess(res, { pet }, 'Pet profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pet profile
// @route   DELETE /api/v1/pets/:id
export const deletePet = async (req, res, next) => {
  try {
    const pet = await PetProfile.findByIdAndDelete(req.params.id);
    if (!pet) {
      return sendError(res, 'Pet profile not found', 404);
    }
    return sendSuccess(res, {}, 'Pet profile deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get dietary nutrition recommendations for a pet
// @route   GET /api/v1/pets/:id/recommendations
export const getPetRecommendations = async (req, res, next) => {
  try {
    const pet = await PetProfile.findById(req.params.id);
    if (!pet) {
      return sendError(res, 'Pet profile not found', 404);
    }

    // Match products based on species and lifestage/dietary requirements
    const query = {
      petType: { $in: [pet.species, 'all'] },
    };

    const products = await Product.find(query).limit(8);
    return sendSuccess(res, { pet, products }, 'Recommendations fetched');
  } catch (error) {
    next(error);
  }
};
