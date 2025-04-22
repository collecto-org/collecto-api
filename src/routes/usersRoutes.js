import express from 'express';
import { verifyToken, loadUserIfAuthenticated  } from '../middlewares/authMiddleware.js';
import { uploadAvatarToCloudinary } from '../utils/upload.js';
import {
  getUserAdverts,
  getCurrentUser,
  editUserProfile,
  deleteUserProfile,
  getOwnAdverts,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserNotifications,
  markNotificationAsRead,
  notifyFavoriteStatusChange,
  notifyPriceChange,
  notifyFavoriteRemoved,
  notifyNewChatMessage,
  createChat,
  sendMessageToChat,
  getUserChats,
  getChatMessages
} from '../controllers/usersController.js';


const router = express.Router();

// Anuncios
router.get('/:username/listings', getUserAdverts); // Ver anuncios de un usuario específico


// Gestión de usuarios
router.get('/me', verifyToken, loadUserIfAuthenticated, getCurrentUser); // Obtener datos del propio usuario
router.put('/me', verifyToken, loadUserIfAuthenticated, uploadAvatarToCloudinary, editUserProfile); // Editar perfil del usuario
router.delete('/me', verifyToken, loadUserIfAuthenticated, deleteUserProfile); // Eliminar perfil del usuario
router.get('/me/adverts', verifyToken, loadUserIfAuthenticated, getOwnAdverts); // Ver anuncios de uno mismo
// Crear nuevo anuncio se encuentra en advertsRoutes.js
// Editar anuncio se encuentra en advertsRoutes.js
// Eliminar anuncio se encuentra en advertsRoutes.js

//Favortos
router.get('/me/favorites', verifyToken, loadUserIfAuthenticated, getUserFavorites); // Obtener "Mis anuncios favoritos"
router.post('/me/favorites/:listingId', verifyToken, loadUserIfAuthenticated, addFavorite); // Agregar un anuncio a favoritos
router.delete('/me/favorites/:listingId', verifyToken, loadUserIfAuthenticated, removeFavorite); // Eliminar un anuncio de favoritos

// Notificaciones
router.get('/me/notifications', verifyToken, loadUserIfAuthenticated, getUserNotifications); // Obtener "Mis notificaciones"
router.patch('/me/notifications/:id/read', verifyToken, loadUserIfAuthenticated, markNotificationAsRead); // Marcar notificación como leída
router.post('/me/notifications/favorite-status-change', verifyToken, loadUserIfAuthenticated, notifyFavoriteStatusChange);  // Notificación de cambio de estado (vendido/reservado/disponible)
router.post('/me/notifications/favorite-price-change', verifyToken, loadUserIfAuthenticated, notifyPriceChange);  // Notificación de cambio de precio
router.post('/me/notifications/favorite-removed', verifyToken, loadUserIfAuthenticated, notifyFavoriteRemoved); // Notificación de eliminación de favorito
router.post('/me/notifications/new-chat-message', verifyToken, loadUserIfAuthenticated, notifyNewChatMessage); // Notificación por nuevos mensajes de chat

// Chats
router.post('/me/chat/:listingId', verifyToken, loadUserIfAuthenticated, createChat);  // Crear chat relacionado por un anuncio
router.get('/me/chat/:chatId', verifyToken, loadUserIfAuthenticated, getChatMessages);  // Ver un chat en particular
router.get('/me/chat', verifyToken, loadUserIfAuthenticated, getUserChats);  // Ver todas las conversaciones
router.post('/me/chat/message/:chatId', verifyToken, loadUserIfAuthenticated, sendMessageToChat);  // Mandar mensaje en un chat





export default router;
