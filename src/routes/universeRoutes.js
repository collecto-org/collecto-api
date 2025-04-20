import express from 'express';
import {
  getAllUniverses,
  createUniverse,
  updateUniverse,
  deleteUniverse,
} from '../controllers/universeController.js';

const router = express.Router();

router.get('/', getAllUniverses);
router.post('/', createUniverse);
router.put('/:id', updateUniverse);
router.delete('/:id', deleteUniverse);

export default router;
