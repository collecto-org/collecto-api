import { getAllCatalogs } from '../services/catalogService.js';

export const getAllCatalogsHandler = async (req, res) => {
  try {
    const catalogs = await getAllCatalogs();
    res.status(200).json(catalogs);
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar los catálogos', error: err.message });
  }
};
