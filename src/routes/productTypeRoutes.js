import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} from '../controllers/productTypeController.js';

const router = express.Router();

// Rutas públicas para obtener tipos de productos
router.get('/', getAllProductTypes);  // Mostrar todos los tipos de productos

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createProductType);  // Crear nuevo tipo de producto (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateProductType);  // Actualizar tipo de producto (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteProductType);  // Eliminar tipo de producto (solo admin)

export default router;
