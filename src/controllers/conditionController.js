import Condition from '../models/condition.js';

// Ver las condiciones disponibles
export const getAllConditions = async (req, res) => {
  try {
    const conditions = await Condition.find();

    if (!conditions.length) {
      return res.status(404).json({ message: 'No hay condiciones disponibles' });
    }

    res.status(200).json(conditions);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las condiciones', error: err.message });
  }
};

// Crear nueva condición (solo admin)
export const createCondition = async (req, res) => {
  try {
    const { value } = req.body;

    const existingCondition = await Condition.findOne({ value });
    if (existingCondition) {
      return res.status(400).json({ message: 'Ya existe una condición con ese valor.' });
    }

    const condition = new Condition({ value });
    await condition.save();

    res.status(201).json(condition);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la condición', error: err.message });
  }
};

// Actualizar condición (solo admin)
export const updateCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const updatedCondition = await Condition.findByIdAndUpdate(id, { value }, { new: true });

    if (!updatedCondition) {
      return res.status(404).json({ message: 'Condición no encontrada.' });
    }

    res.status(200).json(updatedCondition);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la condición', error: err.message });
  }
};

// Eliminar condición (solo admin)
export const deleteCondition = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCondition = await Condition.findByIdAndDelete(id);
    if (!deletedCondition) {
      return res.status(404).json({ message: 'Condición no encontrada.' });
    }

    res.status(200).json({ message: 'Condición eliminada.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la condición', error: err.message });
  }
};
