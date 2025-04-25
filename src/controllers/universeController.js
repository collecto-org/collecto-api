import Universe from '../models/universe.js';

// Ver los universos disponibles
export const getAllUniverses = async (req, res, next) => {
  try {
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; 

    const universes = await Universe.find().sort({ order: sortOrder });

    if (!universes.length) {
      return res.status(404).json({ message: 'No hay universos disponibles.' });
    }

    res.status(200).json(universes);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los universos', error: err.message });
  }
};

// Crear un nuevo universo (solo admin)
export const createUniverse = async (req, res, next) => {
  try {
    const { name, logoUrl, slug } = req.body;

    const existing = await Universe.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Ya existe un universo con ese slug.' });
    }

    const universe = new Universe({ name, logoUrl, slug });
    await universe.save();

    res.status(201).json(universe);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear el universo', error: err.message });
  }
};

// Editar un nuevo universo (solo admin)
export const updateUniverse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, slug } = req.body;

    const updated = await Universe.findByIdAndUpdate(
      id,
      { name, logoUrl, slug },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Universo no encontrado.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar el universo', error: err.message });
  }
};

// Eliminar un nuevo universo (solo admin)
export const deleteUniverse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Universe.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Universo no encontrado.' });
    }

    res.status(200).json({ message: 'Universo eliminado.' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar el universo', error: err.message });
  }
};
