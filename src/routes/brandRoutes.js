import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';

const router = express.Router();

// Rutas públicas para obtener marcas
router.get('/', getAllBrands); // Mostrar todas las marcas

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createBrand);  // Crear nueva marca (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateBrand);  // Actualizar marca (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteBrand);  // Eliminar marca (solo admin)

export default router;
