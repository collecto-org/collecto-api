import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllNotificationTypes,
  createNotificationType,
  updateNotificationType,
  deleteNotificationType,
} from '../controllers/notificationTypesController.js';

const router = express.Router();

// Rutas públicas para obtener tipos de notificación
router.get('/', getAllNotificationTypes);  // Mostrar todos los tipos de notificación

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createNotificationType);  // Crear nuevo tipo de notificación (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateNotificationType);  // Actualizar tipo de notificación (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteNotificationType);  // Eliminar tipo de notificación (solo admin)

export default router;
