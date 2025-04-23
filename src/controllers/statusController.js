import Status from '../models/status.js';

// Ver los estados disponibles
export const getAllStatuses = async (req, res, next) => {
  try {
    const statuses = await Status.find();

    if (!statuses.length) {
      return res.status(404).json({ message: 'No hay estados disponibles.' });
    }

    res.status(200).json(statuses);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los estados', error: err.message });
  }
};

// Crear nuevo estado (solo admin)
export const createStatus = async (req, res, next) => {
  try {
    const { value, description } = req.body;

    const existingStatus = await Status.findOne({ value });
    if (existingStatus) {
      return res.status(400).json({ message: 'Ya existe un estado con ese valor.' });
    }

    const newStatus = new Status({ value, description });
    await newStatus.save();

    res.status(201).json(newStatus);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear el estado', error: err.message });
  }
};

// Actualizar estado (solo admin)
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, description } = req.body;

    const updatedStatus = await Status.findByIdAndUpdate(
      id,
      { value, description },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: 'Estado no encontrado.' });
    }

    res.status(200).json(updatedStatus);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar el estado', error: err.message });
  }
};

// Eliminar estado (solo admin)
export const deleteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedStatus = await Status.findByIdAndDelete(id);
    if (!deletedStatus) {
      return res.status(404).json({ message: 'Estado no encontrado.' });
    }

    res.status(200).json({ message: 'Estado eliminado.' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar el estado', error: err.message });
  }
};
