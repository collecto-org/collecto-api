import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllNotificationTypes,
  createNotificationType,
  updateNotificationType,
  deleteNotificationType,
} from '../controllers/notificationTypesController.js';
import {
  getUserNotifications,
  markNotificationAsRead
} from '../controllers/notificationController.js';


const router = express.Router();

// Notifications 
router.get('/user', verifyToken, getUserNotifications);
router.patch('/:id/read', verifyToken, markNotificationAsRead);

// Notification Types
// Rutas públicas para obtener tipos de notificación
router.get('/types', getAllNotificationTypes);  // Mostrar todos los tipos de notificación
// Rutas protegidas para administradores
router.post('/types', verifyToken, verifyAdmin, createNotificationType);  // Crear nuevo tipo de notificación (solo admin)
router.put('/types/:id', verifyToken, verifyAdmin, updateNotificationType);  // Actualizar tipo de notificación (solo admin)
router.delete('/types/:id', verifyToken, verifyAdmin, deleteNotificationType);  // Eliminar tipo de notificación (solo admin)

export default router;
