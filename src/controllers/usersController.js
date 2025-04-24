import Advert from '../models/advert.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import Chat from '../models/chat.js';
import { v2 as cloudinary } from 'cloudinary';
import { notifyNewMessage } from './notificationsController.js';


// Ver anuncios de un usuario (Endpoint de gestión de anuncios)
export const getUserAdverts = async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const totalAdverts = await Advert.countDocuments({ user: user._id });
    const adverts = await Advert.find({ user: user._id });

    if (!adverts.length) {
      return res.status(404).json({ message: 'No se encontraron anuncios para este usuario' });
    }

    if (req.user) {
      const favorites = req.user.favorites.map(id => id.toString());
      
      const advertsWithFavStatus = adverts.map(advert => ({
        ...advert.toObject(),
        images: advert.images.map(image => cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })),
        isFavorite: favorites.includes(advert._id.toString())
      }));

      return res.status(200).json({
        total: totalAdverts,
        adverts: advertsWithFavStatus,
      });
    }

    const advertsWithoutFavStatus = adverts.map(advert => ({
      ...advert.toObject(),
      images: advert.images.map(image => cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })),
    }));

    res.status(200).json({
      total: totalAdverts,
      adverts: advertsWithoutFavStatus,
    });

  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los anuncios del usuario', error: err.message });
  }
};




// Obtener datos del propio usuario (de si mismo)
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const avatarUrl = user.avatarUrl ? cloudinary.url(user.avatarUrl, { fetch_format: 'auto', quality: 'auto' }) : null;

    res.status(200).json({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      location: user.location,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los datos del usuario', error: err.message });
  }
};


// Editar perfil del usuario
export const editUserProfile = async (req, res, next) => {
  const userId = req.user.id;
  const updatedData = req.body;

  let avatarUrl;

  if (req.body.imageUrls && req.body.imageUrls.length > 0) {
    avatarUrl = req.body.imageUrls[0];
  }

  const allowedFields = ['email', 'firstName', 'lastName', 'dateOfBirth', 'phone', 'location', 'bio'];
  const dataToUpdate = {};

  Object.keys(updatedData).forEach((field) => {
    if (allowedFields.includes(field)) {
      dataToUpdate[field] = updatedData[field];
    }
  });

  if (avatarUrl) {
    dataToUpdate.avatarUrl = avatarUrl;
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.avatarUrl && avatarUrl !== user.avatarUrl) {
      const publicId = user.avatarUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Actualizamos el usuario
    const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true });

    res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar el perfil', error: err.message });
  }
};



// Eliminar el perfil del usuario
export const deleteUserProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await User.findByIdAndDelete(userId);

    if (user.avatarUrl) {
      const publicId = user.avatarUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json({ message: 'Cuenta eliminada' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar el perfil', error: err.message });
  }
};



// Ver anuncios de uno mismo
export const getOwnAdverts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;  // Paginación

    // Consulta para obtener los anuncios de un usuario con paginación
    const adverts = await Advert.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('transaction')
      .populate('status')
      .populate('product_type')
      .populate('universe')
      .populate('condition')
      .populate('brand');

    const totalAdverts = await Advert.countDocuments({ user: userId });

    if (!adverts.length) {
      return res.status(404).json({ message: 'No tienes anuncios publicados.' });
    }

    res.status(200).json({
      totalAdverts,
      adverts,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los anuncios', error: err.message });
  }
};


// Obtener "Mis anuncios favoritos" (favoritos del usuario autenticado)
export const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const user = await User.findById(userId)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('favorites')
      .populate('favorites.transaction')
      .populate('favorites.status')
      .populate('favorites.product_type')
      .populate('favorites.universe')
      .populate('favorites.condition')
      .populate('favorites.brand');
      

    const totalFavorites = user.favorites.length;

    if (!user || totalFavorites === 0) {
      return res.status(404).json({ message: 'No tienes anuncios favoritos.' });
    }

    res.status(200).json({
      total: totalFavorites,  // Total de anuncios favoritos
      adverts: user.favorites,  // Los anuncios favoritos
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener favoritos', error: err.message });
  }
};


// Agregar un anuncio a favoritos
export const addFavorite = async (req, res, next) => {
  const userId = req.user.id;
  const { listingId } = req.params;

  try {
    const user = await User.findById(userId);
    const advert = await Advert.findById(listingId);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (user.favorites.includes(advert._id)) {
      return res.status(400).json({ message: 'Este anuncio ya está en tus favoritos.' });
    }

    user.favorites.push(advert._id);
    await user.save();

    res.status(201).json({ message: 'Añadido a favoritos' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al agregar favorito', error: err.message });
  }
};

// Eliminar un anuncio de favoritos
export const removeFavorite = async (req, res, next) => {
  const userId = req.user.id;
  const { listingId } = req.params;

  try {
    const user = await User.findById(userId);
    const advert = await Advert.findById(listingId);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (!user.favorites.includes(advert._id)) {
      return res.status(400).json({ message: 'Este anuncio no está en tus favoritos.' });
    }

    user.favorites.pull(advert._id);
    await user.save();

    res.status(200).json({ message: 'Eliminado de favoritos' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar favorito', error: err.message });
  }
};


// Obtener "Mis notificaciones"
///export const getUserNotifications = async (req, res, next) => {
///  try {
///    const userId = req.user.id;
//
 //   const notifications = await Notification.find({ user: userId }).populate('advertId', 'title');
//
//    if (!notifications.length) {
//      return res.status(404).json({ message: 'No tienes notificaciones.' });
//    }
//
//    res.status(200).json(notifications);
//  } catch (err) {
//    next(err);
//    res.status(500).json({ message: 'Error al obtener las notificaciones', error: err.message });
//  }
//};


// Marcar notificación como leída
//export const markNotificationAsRead = async (req, res, next) => {
//  try {
//    const userId = req.user.id;
//    const notificationId = req.params.id;
//
//    const notification = await Notification.findById(notificationId);
//
//    if (!notification) {
//      return res.status(404).json({ message: 'Notificación no encontrada' });
 //   }
//
//    if (!notification.user.equals(userId)) {
//      return res.status(403).json({ message: 'No tienes permiso para modificar esta notificación' });
//    }
//
//    notification.isRead = true;
//    await notification.save();
//
//    res.status(200).json({ message: 'Leída' });
//  } catch (err) {
//    next(err);
//    res.status(500).json({ message: 'Error al marcar la notificación como leída', error: err.message });
//  }
//};


// Notificación de cambio de estado de favorito (vendido/reservado/disponible)
//export const notifyFavoriteStatusChange = async (req, res, next) => {
//  const userId = req.user.id;
//  const { advertId, status } = req.body;
//
 // try {
 //   if (!['sold', 'reserved', 'available'].includes(status)) {
//      return res.status(400).json({ message: 'Estado inválido. Debe ser "sold", "reserved" o "available".' });
//    }
//
//    const advert = await Advert.findById(advertId);
//    if (!advert) {
//      return res.status(404).json({ message: 'Anuncio no encontrado' });
//    }
//
//    // Verificar que el anuncio está en favoritos
//    const user = await User.findById(userId);
//    if (!user || !user.favorites.includes(advertId)) {
 //     return res.status(400).json({ message: 'El anuncio no está en tus favoritos' });
//    }

//    // Crear el mensaje dependiendo del estado
//    const notificationType = await NotificationType.findOne({ code: 'favorite-status-change' });
//
//    const message = `El artículo "${advert.title}" ha sido marcado como ${status}.`;
//    
//
//    // Crear la notificación
//    const newNotification = new Notification({
//      user: userId,
//      notificationType: 'favorite-status-change',
//      advertId: advert._id,
//      message,
//      isRead: false,
//      createdAt: new Date(),
//   });
//
//    await newNotification.save();
//
//    res.status(201).json({ message: 'Notificación de cambio de estado de favorito creada', notification: newNotification });
//
//  } catch (err) {
//    console.error(err);
//    next(err);
//    res.status(500).json({ message: 'Error al crear la notificación de cambio de estado', error: err.message });
//  }
//};



// Notificación cuando un artículo favorito cambia de precio
//export const notifyPriceChange = async (req, res, next) => {
//  const { advertId } = req.body;
//  try {
//    const advert = await Advert.findById(advertId);
//
//    if (!advert) {
 //     return res.status(404).json({ message: 'Anuncio no encontrado' });
 //   }
//
 //   const usersWithFavorite = await User.find({ favorites: advertId });
//
//    if (usersWithFavorite.length === 0) {
//      return res.status(404).json({ message: 'No hay usuarios que tengan este anuncio como favorito' });
 //   }
//
//    const priceChangeNotificationType = "price-change";
//
//    // Enviar notificación a cada usuario
//    usersWithFavorite.forEach(async (user) => {
 //     const newNotification = new Notification({
//        user: user.id,
//        notificationType: priceChangeNotificationType,
//        message: `El artículo "${advert.title}" ha cambiado de precio.`,
///        read: false,
//        advert: advertId,
//      });
//      await newNotification.save();
//    });
//
//    res.status(201).json({ message: 'Notificación de cambio de precio enviada' });
//  } catch (err) {
//    next(err);
//    res.status(500).json({ message: 'Error al crear la notificación', error: err.message });
//  }
//};


// Notificación cuando un usuario elimina un favorito
//export const notifyFavoriteRemoved = async (req, res, next) => {
//  const { advertId } = req.body;
//  try {
//    const advert = await Advert.findById(advertId);
//
//    if (!advert) {
 //     return res.status(404).json({ message: 'Anuncio no encontrado' });
//    }
//
 //   const usersWithFavorite = await User.find({ favorites: advertId });

 //   if (usersWithFavorite.length === 0) {
//      return res.status(404).json({ message: 'No hay usuarios que tengan este anuncio como favorito' });
//    }

//    const favoriteRemovedNotificationType = "favorite-removed";

 //   // Enviar notificación a cada usuario
 //   usersWithFavorite.forEach(async (user) => {
//      const newNotification = new Notification({
//        user: user.id,
//        notificationType: favoriteRemovedNotificationType,
//        message: `El artículo "${advert.title}" ha sido eliminado de tus favoritos.`,
//        read: false,
//        advert: advertId,
//      });
//      await newNotification.save();
//    });

//    res.status(201).json({ message: 'Notificación de eliminación de favorito enviada' });
//  } catch (err) {
//    next(err);
//    res.status(500).json({ message: 'Error al crear la notificación', error: err.message });
//  }
//};


// Notificación de nuevo mensaje en el chat
//export const notifyNewChatMessage = async (req, res, next) => {
//  const { chatId } = req.body;

//  try {
//    const chat = await Chat.findById(chatId)
//      .populate('advertId')
//      .populate('users');
//
//    if (!chat) {
//      return res.status(404).json({ message: 'Chat no encontrado' });
//    }
//
//    const advert = chat.advertId;
//    if (!advert) {
//      return res.status(404).json({ message: 'Anuncio no encontrado' });
//    }

//    const userIds = chat.users.map(user => user.id);

    // Trunca el título del anuncio si es muy largo
//    const truncatedTitle = advert.title.length > 50 ? advert.title.substring(0, 50) + '...' : advert.title;
//    const message = `Tienes un nuevo mensaje en la conversación sobre "${truncatedTitle}".`;

//    for (const userId of userIds) {
//      const newNotification = new Notification({
//        user: userId,
//        notificationType: 'new-chat-message',
//        message,
//        read: false,
//        advert: advert.id,
//        chatId: chat.id,
//      });

//      await newNotification.save();
//    }

//    res.status(201).json({ message: 'Notificación de nuevo mensaje enviada' });
//  } catch (err) {
//    next(err);
//    res.status(500).json({ message: 'Error al crear la notificación', error: err.message });
//  }
//};


// Crear conversación por anuncio
export const createChat = async (req, res, next) => {
  const { listingId } = req.params;
  const userId = req.user.id; 

  try {
    const advert = await Advert.findById(listingId);
    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (advert.user.toString() === userId) {
      return res.status(400).json({ message: 'No puedes chatear contigo mismo' });
    }

    let chat = await Chat.findOne({ advertId: listingId, users: { $all: [userId, advert.user] } });

    if (!chat) {
      chat = new Chat({
        advertId: listingId,
        users: [userId, advert.user],  // Los usuarios que participan en el chat
      });

      await chat.save();
    }

    res.status(201).json({ chatId: chat.id });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear la conversación', error: err.message });
  }
};



// Enviar mensaje en un chat ///////////////////////////////////////////////////////////////////////////////////////
export const sendMessageToChat = async (req, res, next) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  try {
    const chat = await Chat.findById(chatId).populate('users');

    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    if (!chat.users.some(user => user._id.toString() === senderId)) {
      return res.status(403).json({ message: 'No tienes permiso para enviar mensajes en este chat' });
    }

    const newMessage = {
      sender: senderId,
      content: content,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    const receiver = chat.users.find(user => user._id.toString() !== senderId);

    if (receiver) { /////////////////////////////////////////////////////
      await notifyNewMessage({ ///////////////////////////////////////
        advertId: chat.advertId,/////////////////////////////////
        senderId,////////////////////////////////////////
        recipientId: receiver._id, ////////////////////////////////////////
      });
    }

    res.status(201).json({ message: 'Mensaje enviado' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al enviar mensaje', error: err.message });
  }
};




// Obtener todas las conversaciones del usuario
export const getUserChats = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Buscar todos los chats
    const chats = await Chat.find({ users: userId })
      .populate('advertId', 'title')
      .populate('users', 'username avatar')
      .sort({ 'messages.createdAt': -1 });

    if (!chats.length) {
      return res.status(404).json({ message: 'No tienes conversaciones.' });
    }

    // Crear una vista previa para cada chat
    const chatPreviews = chats.map(chat => {
      const lastMessage = chat.messages[chat.messages.length - 1];
      const previewMessage = lastMessage ? `${lastMessage.content.substring(0, 30)}...` : 'No hay mensajes aún';
      return {
        chatId: chat._id,
        advertTitle: chat.advertId.title,
        participants: chat.users.map(user => user.username),
        lastMessage: previewMessage,
        lastMessageTimestamp: lastMessage ? lastMessage.createdAt : null,
      };
    });

    res.status(200).json(chatPreviews);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener las conversaciones', error: err.message });
  }
};



// Ver un chat en particular
export const getChatMessages = async (req, res, next) => {
  const userId = req.user.id;
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId)
      .populate('advertId', 'title') 
      .populate('users', 'username avatarUrl') 

    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    if (!chat.users.some(user => user._id.toString() === userId.toString())) {
      return res.status(403).json({ message: 'No tienes permiso para ver este chat' });
    }

    const messages = chat.messages.map(message => ({
      sender: {
        username: message.sender.username,
        avatarUrl: message.sender.avatarUrl || 'default_avatar_url',  // Default avatar si no está disponible (pendiente de definir)
      },
      content: message.content,
      createdAt: message.createdAt,
    }));

    res.status(200).json(messages);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los mensajes del chat', error: err.message });
  }
};

