import Collection from '../models/collection.js';

export const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find();

    if (!collections.length) {
      return res.status(404).json({ message: 'No hay colecciones disponibles' });
    }

    res.status(200).json(collections);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las colecciones', error: err.message });
  }
};
