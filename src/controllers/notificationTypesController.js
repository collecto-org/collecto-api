import NotificationType from '../models/notificationTypes.js';
import { createNotificationMessage } from '../utils/notificationUtils.js';
import { logDetailedError } from '../utils/logger.js';

// Ver los tipos de notificación disponibles
export const getAllNotificationTypes = async (req, res, next) => {
  try {
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    const notificationTypes = await NotificationType.find().sort({ order: sortOrder });

    if (!notificationTypes.length) {
      return res.status(404).json({ message: 'No hay tipos de notificación disponibles' });
    }

    res.status(200).json(notificationTypes);
  } catch (err) {
    //next(err);
    logDetailedError(err, req, 'getAllNotificationTypes');
    res.status(500).json({ message: 'Error al obtener los tipos de notificación', error: err.message });
  }
};

// Crear nuevo tipo de notificación (solo admin)
export const createNotificationType = async (req, res, next) => {
  try {
    const { code, label, template, icon, order } = req.body;

    const existingType = await NotificationType.findOne({ code });
    if (existingType) {
      return res.status(400).json({ message: 'Ya existe un tipo de notificación con ese código.' });
    }

    const newNotificationType = new NotificationType({ code, label, template, icon, order });
    await newNotificationType.save();

    res.status(201).json(newNotificationType);
  } catch (err) {
        //next(err);
        logDetailedError(err, req, 'createNotificationType');
    res.status(500).json({ message: 'Error al crear el tipo de notificación', error: err.message });
  }
};

// Actualizar tipo de notificación (solo admin)
export const updateNotificationType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, label, template, icon, order } = req.body;

    const updatedNotificationType = await NotificationType.findByIdAndUpdate(
      id,
      { code, label, template, icon, order },
      { new: true }
    );

    if (!updatedNotificationType) {
      return res.status(404).json({ message: 'Tipo de notificación no encontrado.' });
    }

    res.status(200).json(updatedNotificationType);
  } catch (err) {
    //next(err);
    logDetailedError(err, req, 'updateNotificationType');
    res.status(500).json({ message: 'Error al actualizar el tipo de notificación', error: err.message });
  }
};

// Eliminar tipo de notificación (solo admin)
export const deleteNotificationType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedNotificationType = await NotificationType.findByIdAndDelete(id);
    if (!deletedNotificationType) {
      return res.status(404).json({ message: 'Tipo de notificación no encontrado.' });
    }

    res.status(200).json({ message: 'Tipo de notificación eliminado.' });
  } catch (err) {
    //next(err);
    logDetailedError(err, req, 'deleteNotificationType');
    res.status(500).json({ message: 'Error al eliminar el tipo de notificación', error: err.message });
  }
};

// Crear el mensaje de notificación basado en el template para alimentar los placeholders '{title}' etc.
export const generateNotificationMessage = async (typeCode, data) => { 
  const notificationType = await NotificationType.findOne({ code: typeCode });

  if (!notificationType) {
    throw new Error('Tipo de notificación no encontrada');
  }

  return createNotificationMessage(notificationType.template, data);
};
