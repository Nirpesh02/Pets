import express from 'express';
import {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getPetRecommendations,
} from '../controllers/petController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Allow reading pets (protected if logged in)
router.get('/', getPets);
router.get('/:id', getPetById);
router.get('/:id/recommendations', getPetRecommendations);

router.post('/', createPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

export default router;
