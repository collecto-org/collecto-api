import Notification from '../models/notification.js';
import NotificationType from '../models/notificationTypes.js';
import User from '../models/user.js';
import Advert from '../models/advert.js';



export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .populate('notificationType', 'label icon') // mostrar nombre legible e icono
      .populate('advertId', 'title') // para mostrar el título del anuncio
      .sort({ createdAt: -1 }); // las más recientes primero

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err.message);
    next(err);
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
    next(err);
    res.status(500).json({ message: 'Error al marcar la notificación como leída.', error: err.message });
  }
};



export const notifyStatusChange = async (advertId, statusCode) => {
  try {
    const advert = await Advert.findById(advertId).populate('user');
    if (!advert) throw new Error('Anuncio no encontrado.');

    const users = await User.find({ favorites: advertId });
    if (!users.length) return;

    const notificationType = await NotificationType.findOne({ code: statusCode });
    if (!notificationType) throw new Error('Tipo de notificación no encontrado.');

    const messageTemplate = notificationType.template;
    const message = messageTemplate.replace('{title}', advert.title);

    const notifications = users.map(user => ({
      user: user._id,
      notificationType: notificationType._id,
      advertId: advert._id,
      message,
    }));

    await Notification.insertMany(notifications);
    console.log(`Notificaciones enviadas a ${users.length} usuarios favoritos.`);
  } catch (err) {
    console.error('Error notificando cambio de estado:', err.message);
  }
};



export const notifyPriceChange = async (advert) => {
  try {
    const users = await User.find({ favorites: advert._id });
    if (!users.length) return;

    const notificationType = await NotificationType.findOne({ code: 'price' });
    if (!notificationType) throw new Error('Tipo de notificación "price" no encontrado.');

    const messageTemplate = notificationType.template;
    const message = messageTemplate
      .replace('{title}', advert.title)
      .replace('{price}', advert.price.toFixed(2));

    const notifications = users.map(user => ({
      user: user._id,
      notificationType: notificationType._id,
      advertId: advert._id,
      message,
    }));

    await Notification.insertMany(notifications);
    console.log(`Notificaciones de cambio de precio enviadas a ${users.length} usuarios.`);
  } catch (err) {
    console.error('Error notificando cambio de precio:', err.message);
  }
};



export const notifyAdvertDeleted = async (advert) => {
  try {
    const users = await User.find({ favorites: advert._id });
    if (!users.length) return;

    const notificationType = await NotificationType.findOne({ code: 'deleted' });
    if (!notificationType) throw new Error('Tipo de notificación "deleted" no encontrado.');

    const message = notificationType.template
      .replace('{title}', advert.title);

    const notifications = users.map(user => ({
      user: user._id,
      notificationType: notificationType._id,
      advertId: advert._id,
      message,
    }));

    await Notification.insertMany(notifications);
    console.log(`Notificaciones de eliminación enviadas a ${users.length} usuarios.`);
  } catch (err) {
    console.error('Error notificando eliminación de anuncio:', err.message);
  }
};


export const notifyNewMessage = async ({ advertId, senderId, recipientId }) => {
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
    console.log(`Notificación de nuevo mensaje enviada a ${recipientId}.`);
  } catch (err) {
    console.error('Error al crear notificación de mensaje:', err.message);
  }
};


