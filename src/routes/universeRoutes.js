import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllUniverses,
  createUniverse,
  updateUniverse,
  deleteUniverse,
} from '../controllers/universeController.js';

const router = express.Router();

// Rutas públicas para obtener universos
router.get('/', getAllUniverses); // Mostrar todos los universos

// Rutas protegidas para administradores
router.post('/universes', verifyToken, verifyAdmin, createUniverse);  // Crear nuevo universo (solo admin)
router.put('/universes/:id', verifyToken, verifyAdmin, updateUniverse);  // Actualizar universo (solo admin)
router.delete('/universes/:id', verifyToken, verifyAdmin, deleteUniverse);  // Eliminar universo (solo admin)

export default router;
