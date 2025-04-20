import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../controllers/collectionController.js';

const router = express.Router();

// Rutas públicas para obtener colecciones
router.get('/', getAllCollections); // Mostrar todas las colecciones

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createCollection);  // Crear nueva colección (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateCollection);  // Actualizar colección (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteCollection);  // Eliminar colección (solo admin)

export default router;
