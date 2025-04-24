import express from 'express';
import { verifyToken, loadUserIfAuthenticated } from '../middlewares/authMiddleware.js';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  notifyFavoriteStatusChange, 
  notifyPriceChange, 
  notifyFavoriteRemoved, 
  notifyNewChatMessage 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/me/notifications', verifyToken, loadUserIfAuthenticated, getUserNotifications); // Obtener "Mis notificaciones"
router.patch('/me/notifications/:id/read', verifyToken, loadUserIfAuthenticated, markNotificationAsRead); // Marcar notificación como leída
router.post('/me/notifications/favorite-status-change', verifyToken, loadUserIfAuthenticated, notifyFavoriteStatusChange);  // Notificación de cambio de estado (vendido/reservado/disponible)
router.post('/me/notifications/favorite-price-change', verifyToken, loadUserIfAuthenticated, notifyPriceChange);  // Notificación de cambio de precio
router.post('/me/notifications/favorite-removed', verifyToken, loadUserIfAuthenticated, notifyFavoriteRemoved); // Notificación de eliminación de favorito
router.post('/me/notifications/new-chat-message', verifyToken, loadUserIfAuthenticated, notifyNewChatMessage); // Notificación por nuevos mensajes de chat

export default router;
