import Collection from '../models/collection.js';

// Ver las colecciones disponibles
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

// Crear una nueva colección (solo admin)
export const createCollection = async (req, res) => {
  try {
    const { name, slug } = req.body;

    const existingCollection = await Collection.findOne({ slug });
    if (existingCollection) {
      return res.status(400).json({ message: 'Ya existe una colección con ese slug.' });
    }

    const collection = new Collection({ name, slug });
    await collection.save();

    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la colección', error: err.message });
  }
};

// Actualizar colección (solo admin)
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const updatedCollection = await Collection.findByIdAndUpdate(id, { name, slug }, { new: true });

    if (!updatedCollection) {
      return res.status(404).json({ message: 'Colección no encontrada.' });
    }

    res.status(200).json(updatedCollection);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la colección', error: err.message });
  }
};

// Eliminar colección (solo admin)
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCollection = await Collection.findByIdAndDelete(id);
    if (!deletedCollection) {
      return res.status(404).json({ message: 'Colección no encontrada.' });
    }

    res.status(200).json({ message: 'Colección eliminada.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la colección', error: err.message });
  }
};
