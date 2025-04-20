import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllConditions,
  createCondition,
  updateCondition,
  deleteCondition,
} from '../controllers/conditionController.js';

const router = express.Router();

// Rutas públicas para obtener condiciones
router.get('/', getAllConditions); // Mostrar todas las condiciones

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createCondition);  // Crear nueva condición (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateCondition);  // Actualizar condición (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteCondition);  // Eliminar condición (solo admin)

export default router;
