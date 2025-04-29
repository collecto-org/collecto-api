import SavedSearch from '../models/savedSearch.js';

export const saveSearch = async (req, res, next) => {
  const { userId, name, filters, notifyByEmail } = req.body;

  try {
    const savedSearch = new SavedSearch({
      userId,
      name,
      filters,
      notifyByEmail,
    });

    await savedSearch.save();

    res.status(200).json({ message: 'Búsqueda guardada correctamente', savedSearch });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al guardar la búsqueda', error: err.message });
  }
};
