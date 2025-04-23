import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllCollectionrefs,
  createCollectionref,
  updateCollectionref,
  deleteCollectionref,
} from '../controllers/collectionrefController.js';

const router = express.Router();

// Rutas públicas para obtener colecciones
router.get('/', getAllCollectionrefs); // Mostrar todas las colecciones

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createCollectionref);  // Crear nueva colección (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateCollectionref);  // Actualizar colección (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteCollectionref);  // Eliminar colección (solo admin)

export default router;
