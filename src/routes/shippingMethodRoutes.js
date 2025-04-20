import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from '../controllers/shippingMethodController.js';

const router = express.Router();

// Rutas públicas para obtener métodos de envío
router.get('/', getAllShippingMethods);  // Mostrar todos los métodos de envío

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createShippingMethod);  // Crear nuevo método de envío (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateShippingMethod);  // Actualizar método de envío (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteShippingMethod);  // Eliminar método de envío (solo admin)

export default router;
