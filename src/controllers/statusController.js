import Status from '../models/status.js';

export const getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();

    if (!statuses.length) {
      return res.status(404).json({ message: 'No hay estados disponibles.' });
    }

    res.status(200).json(statuses);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los estados', error: err.message });
  }
};
