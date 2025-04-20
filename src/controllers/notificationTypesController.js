import NotificationType from '../models/notificationTypes.js';

// Ver los tipos de notificación disponibles
export const getAllNotificationTypes = async (req, res) => {
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

// Crear nuevo tipo de notificación (solo admin)
export const createNotificationType = async (req, res) => {
  try {
    const { code, label, template } = req.body;

    const existingType = await NotificationType.findOne({ code });
    if (existingType) {
      return res.status(400).json({ message: 'Ya existe un tipo de notificación con ese código.' });
    }

    const newNotificationType = new NotificationType({ code, label, template });
    await newNotificationType.save();

    res.status(201).json(newNotificationType);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el tipo de notificación', error: err.message });
  }
};

// Actualizar tipo de notificación (solo admin)
export const updateNotificationType = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, label, template } = req.body;

    const updatedNotificationType = await NotificationType.findByIdAndUpdate(
      id,
      { code, label, template },
      { new: true }
    );

    if (!updatedNotificationType) {
      return res.status(404).json({ message: 'Tipo de notificación no encontrado.' });
    }

    res.status(200).json(updatedNotificationType);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el tipo de notificación', error: err.message });
  }
};

// Eliminar tipo de notificación (solo admin)
export const deleteNotificationType = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNotificationType = await NotificationType.findByIdAndDelete(id);
    if (!deletedNotificationType) {
      return res.status(404).json({ message: 'Tipo de notificación no encontrado.' });
    }

    res.status(200).json({ message: 'Tipo de notificación eliminado.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el tipo de notificación', error: err.message });
  }
};
