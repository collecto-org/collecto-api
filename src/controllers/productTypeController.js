import ProductType from '../models/productType.js';

// Obtener todos los tipos de productos
export const getAllProductTypes = async (req, res) => {
  try {
    const productTypes = await ProductType.find();

    if (!productTypes.length) {
      return res.status(404).json({ message: 'No hay tipos de productos disponibles' });
    }

    res.status(200).json(productTypes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los tipos de productos', error: err.message });
  }
};
