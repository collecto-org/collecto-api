import express from 'express';
import { getAllGenders, getGenderById, createGender, updateGender, deleteGender } from '../controllers/genderController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Ruta pública
router.get('/', getAllGenders);

// Rutas protegidas
router.get('/:id', verifyToken, verifyAdmin, getGenderById);
router.post('/', verifyToken, verifyAdmin, createGender);
router.put('/:id', verifyToken, verifyAdmin, updateGender);
router.delete('/:id', verifyToken, verifyAdmin, deleteGender);

export default router;
