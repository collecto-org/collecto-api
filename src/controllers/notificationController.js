import Notification from '../models/notification.js';
import NotificationType from '../models/notificationTypes.js';
import User from '../models/user.js';
import Advert from '../models/advert.js';
import Status from '../models/status.js';
import { sendEmailNotification } from '../utils/emailUtils.js';



export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .populate('notificationType', 'label icon') // mostrar nombre legible e icono
      .populate('advertId', 'title') // para mostrar el título del anuncio
      .sort({ createdAt: -1 }); // las más recientes primero

      console.log("llega")


    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err.message);
    res.status(500).json({ message: 'Error al obtener las notificaciones', error: err.message });
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await Notification.findOne({ _id: id, user: userId });


    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada o no te pertenece.' });
    }

    if (notification.isRead) {
      return res.status(200).json({ message: 'La notificación ya estaba marcada como leída.' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notificación marcada como leída.', notification });
  } catch (err) {
    res.status(500).json({ message: 'Error al marcar la notificación como leída.', error: err.message });
  }
};



export const notifyStatusChange = async (advert, io, connectedUsers) => {
  try {
    const users = await User.find({ favorites: advert._id });
    if (!users.length) return;

    const status = await Status.findById(advert.status);
    const notificationType = await NotificationType.findOne({ code: status.code });
    if (!notificationType) throw new Error('Tipo de notificación no encontrado.');

    const messageTemplate = notificationType.template;
    const message = messageTemplate.replace('{title}', advert.title);
    
    for (const user of users) {
      const notification = new Notification({
        user: user._id,
        notificationType: notificationType._id,
        advertId: advert._id,
        message,
      });

      await notification.save();

      const socketId = connectedUsers.get(user._id.toString());

      if (socketId) {
        //  Si elñ usuario está conectado: Enviar por Socket.IO
        io.to(socketId).emit('new-notification', {
          message,
          advert: {
            title: advert.title,
            slug: advert.slug,
            image: advert.image,
          },
          type: {
            label: notificationType.label,
            icon: notificationType.icon,
          },
        });
      } else {
        // Si el usuario no está conectado: Enviar por email
        await sendEmailNotification(user.email, message);
      }
    }

    console.log(`Notificaciones de estado enviadas a ${users.length} usuarios.`);
  } catch (err) {
    console.error('Error notificando cambio de estado:', err.message);
  }
};



export const notifyPriceChange = async (advert, io, connectedUsers) => {
  try {
    const users = await User.find({ favorites: advert._id });
    if (!users.length) return;

    const notificationType = await NotificationType.findOne({ code: 'price' });
    if (!notificationType) throw new Error('Tipo de notificación "price" no encontrado.');

    const messageTemplate = notificationType.template;
    const message = messageTemplate
      .replace('{title}', advert.title)
      .replace('{price}', advert.price.toFixed(2));

    for (const user of users) {
      const notification = new Notification({
        user: user._id,
        notificationType: notificationType._id,
        advertId: advert._id,
        message,
      });

      await notification.save();

      const socketId = connectedUsers.get(user._id.toString());

      if (socketId) {
        io.to(socketId).emit('new-notification', {
          message,
          advert: {
            title: advert.title,
            slug: advert.slug,
            image: advert.image,
          },
          type: {
            label: notificationType.label,
            icon: notificationType.icon,
          },
        });
      } else {
        await sendEmailNotification(user.email, message);
      }
    }

    console.log(`Notificaciones de cambio de precio enviadas a ${users.length} usuarios.`);
  } catch (err) {
    console.error('Error notificando cambio de precio:', err.message);
  }
};




export const notifyAdvertDeleted = async (advert, io, connectedUsers) => {
  try {
    const users = await User.find({ favorites: advert._id });
    if (!users.length) return;

    const notificationType = await NotificationType.findOne({ code: 'deleted' });
    if (!notificationType) throw new Error('Tipo de notificación "deleted" no encontrado.');

    const message = notificationType.template.replace('{title}', advert.title);

    for (const user of users) {
      const notification = new Notification({
        user: user._id,
        notificationType: notificationType._id,
        advertId: advert._id,
        message,
      });

      await notification.save();

      const socketId = connectedUsers.get(user._id.toString());

      if (socketId) {
        io.to(socketId).emit('new-notification', {
          message,
          advert: {
            title: advert.title,
            slug: advert.slug,
            image: advert.image,
          },
          type: {
            label: notificationType.label,
            icon: notificationType.icon,
          },
        });
      } else {
        await sendEmailNotification(user.email, message);
      }
    }

    console.log(`Notificaciones de eliminación enviadas a ${users.length} usuarios.`);
  } catch (err) {
    console.error('Error notificando eliminación de anuncio:', err.message);
  }
};



export const notifyNewMessage = async ({ advertId, senderId, recipientId }, io, connectedUsers) => {
  try {
    const [advert, sender, notificationType] = await Promise.all([
      Advert.findById(advertId),
      User.findById(senderId),
      NotificationType.findOne({ code: 'message' }),
    ]);

    if (!advert || !sender || !notificationType) {
      throw new Error('Faltan datos para la notificación de mensaje.');
    }

    const message = notificationType.template
      .replace('{title}', advert.title)
      .replace('{sender}', sender.username || sender.name || 'otro usuario');

    const notification = new Notification({
      user: recipientId,
      notificationType: notificationType._id,
      advertId,
      message,
    });

    await notification.save();

    const socketId = connectedUsers.get(recipientId.toString());

    if (socketId) {
      io.to(socketId).emit('new-notification', {
        message,
        advert: {
          title: advert.title,
          slug: advert.slug,
          image: advert.image,
        },
        type: {
          label: notificationType.label,
          icon: notificationType.icon,
        },
      });
    } else {
      const recipient = await User.findById(recipientId);
      if (recipient?.email) {
        await sendEmailNotification(recipient.email, message);
      }
    }

    console.log(`Notificación de nuevo mensaje enviada a ${recipientId}.`);
  } catch (err) {
    console.error('Error al crear notificación de mensaje:', err.message);
  }
};

