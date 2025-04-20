import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from '../controllers/statusController.js';

const router = express.Router();

// Rutas públicas para obtener estados
router.get('/', getAllStatuses);  // Mostrar todos los estados

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createStatus);  // Crear nuevo estado (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateStatus);  // Actualizar estado (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteStatus);  // Eliminar estado (solo admin)

export default router;
