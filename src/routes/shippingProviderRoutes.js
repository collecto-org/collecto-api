import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllShippingProviders,
  createShippingProvider,
  updateShippingProvider,
  deleteShippingProvider,
} from '../controllers/shippingProviderController.js';

const router = express.Router();

// Rutas públicas para obtener proveedores de envío
router.get('/', getAllShippingProviders);  // Mostrar todos los proveedores de envío

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createShippingProvider);  // Crear nuevo proveedor de envío (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateShippingProvider);  // Actualizar proveedor de envío (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteShippingProvider);  // Eliminar proveedor de envío (solo admin)

export default router;