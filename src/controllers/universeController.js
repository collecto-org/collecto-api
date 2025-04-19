import Universe from '../models/universe.js';

export const getAllUniverses = async (req, res) => {
  try {
    const universes = await Universe.find();

    if (!universes.length) {
      return res.status(404).json({ message: 'No hay universos disponibles.' });
    }

    res.status(200).json(universes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los universos', error: err.message });
  }
};
