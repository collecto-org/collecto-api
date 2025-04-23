import Collectionref from '../models/collectionref.js';

// Ver las colecciones disponibles
export const getAllCollectionrefs = async (req, res, next) => {
  try {
    const collectionrefs = await Collectionref.find();

    if (!collectionrefs.length) {
      return res.status(404).json({ message: 'No hay colecciones disponibles' });
    }

    res.status(200).json(collectionrefs);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener las colecciones', error: err.message });
  }
};

// Crear una nueva colección (solo admin)
export const createCollectionref = async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    const existingCollectionref = await Collectionref.findOne({ slug });
    if (existingCollectionref) {
      return res.status(400).json({ message: 'Ya existe una colección con ese slug.' });
    }

    const collectionref = new Collectionref({ name, slug });
    await collectionref.save();

    res.status(201).json(collectionref);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear la colección', error: err.message });
  }
};

// Actualizar colección (solo admin)
export const updateCollectionref = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const updatedCollectionref = await Collectionref.findByIdAndUpdate(id, { name, slug }, { new: true });

    if (!updatedCollectionref) {
      return res.status(404).json({ message: 'Colección no encontrada.' });
    }

    res.status(200).json(updatedCollectionref);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar la colección', error: err.message });
  }
};

// Eliminar colección (solo admin)
export const deleteCollectionref = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedCollectionref = await Collectionref.findByIdAndDelete(id);
    if (!deletedCollectionref) {
      return res.status(404).json({ message: 'Colección no encontrada.' });
    }

    res.status(200).json({ message: 'Colección eliminada.' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar la colección', error: err.message });
  }
};
