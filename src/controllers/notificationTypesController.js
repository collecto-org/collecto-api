import NotificationType from '../models/notificationType.js';

export const getNotificationTypes = async (req, res) => {
  try {
    const notificationTypes = await NotificationType.find();

    if (!notificationTypes.length) {
      return res.status(404).json({ message: 'No hay tipos de notificación disponibles' });
    }

    res.status(200).json(notificationTypes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los tipos de notificación', error: err.message });
  }
};
