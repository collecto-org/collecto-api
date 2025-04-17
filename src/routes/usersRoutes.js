import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import upload from '../utils/upload.js';
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
router.get('/me', verifyToken, getCurrentUser); // Obtener datos del propio usuario
router.put('/me', verifyToken, upload, editUserProfile); // Editar perfil del usuario
router.delete('/me', verifyToken, deleteUserProfile); // Eliminar perfil del usuario
router.get('/me/adverts', verifyToken, getOwnAdverts); // Ver anuncios de uno mismo
// Crear nuevo anuncio se encuentra en advertsRoutes.js
// Editar anuncio se encuentra en advertsRoutes.js
// Eliminar anuncio se encuentra en advertsRoutes.js

//Favortos
router.get('/me/favorites', verifyToken, getUserFavorites); // Obtener "Mis anuncios favoritos"
router.post('/me/favorites/:listingId', verifyToken, addFavorite); // Agregar un anuncio a favoritos
router.delete('/me/favorites/:listingId', verifyToken, removeFavorite); // Eliminar un anuncio de favoritos

// Notificaciones
router.get('/me/notifications', verifyToken, getUserNotifications); // Obtener "Mis notificaciones"
router.patch('/me/notifications/:id/read', verifyToken, markNotificationAsRead); // Marcar notificación como leída
router.post('/me/notifications/favorite-status-change', verifyToken, notifyFavoriteStatusChange);  // Notificación de cambio de estado (vendido/reservado/disponible)
router.post('/me/notifications/favorite-price-change', verifyToken, notifyPriceChange);  // Notificación de cambio de precio
router.post('/me/notifications/favorite-removed', verifyToken, notifyFavoriteRemoved); // Notificación de eliminación de favorito
router.post('/me/notifications/new-chat-message', verifyToken, notifyNewChatMessage); // Notificación por nuevos mensajes de chat

// Chats
router.post('/me/chat/:listingId', verifyToken, createChat);  // Crear chat relacionado por un anuncio
router.get('/me/chat/:chatId', verifyToken, getChatMessages);  // Ver un chat en particular
router.get('/me/chat', verifyToken, getUserChats);  // Ver todas las conversaciones
router.post('/me/chat/message/:chatId', verifyToken, sendMessageToChat);  // Mandar mensaje en un chat





export default router;
