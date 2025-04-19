import Condition from '../models/condition.js';

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
