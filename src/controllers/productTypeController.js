import ProductType from '../models/productType.js';

//Ver los tipos de productos disponibles
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

// Crear nuevo tipo de producto (solo admin)
export const createProductType = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    const existingType = await ProductType.findOne({ slug });
    if (existingType) {
      return res.status(400).json({ message: 'Ya existe un tipo de producto con ese slug.' });
    }

    const newProductType = new ProductType({ name, slug, description });
    await newProductType.save();

    res.status(201).json(newProductType);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el tipo de producto', error: err.message });
  }
};

// Actualizar tipo de producto (solo admin)
export const updateProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const updatedProductType = await ProductType.findByIdAndUpdate(
      id,
      { name, slug, description },
      { new: true }
    );

    if (!updatedProductType) {
      return res.status(404).json({ message: 'Tipo de producto no encontrado.' });
    }

    res.status(200).json(updatedProductType);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el tipo de producto', error: err.message });
  }
};

// Eliminar tipo de producto (solo admin)
export const deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProductType = await ProductType.findByIdAndDelete(id);
    if (!deletedProductType) {
      return res.status(404).json({ message: 'Tipo de producto no encontrado.' });
    }

    res.status(200).json({ message: 'Tipo de producto eliminado.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el tipo de producto', error: err.message });
  }
};