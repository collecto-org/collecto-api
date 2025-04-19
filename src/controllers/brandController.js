import Brand from '../models/brand.js';

export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();

    if (!brands.length) {
      return res.status(404).json({ message: 'No hay marcas disponibles' });
    }

    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las marcas', error: err.message });
  }
};
