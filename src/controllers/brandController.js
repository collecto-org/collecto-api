import Brand from '../models/brand.js';

// Ver las marcas disponibles
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

// Crear una nueva marca (solo admin)
export const createBrand = async (req, res) => {
  try {
    const { name, logoUrl, slug } = req.body;

    const existingBrand = await Brand.findOne({ slug });
    if (existingBrand) {
      return res.status(400).json({ message: 'Ya existe una marca con ese slug.' });
    }

    const brand = new Brand({ name, logoUrl, slug });
    await brand.save();

    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la marca', error: err.message });
  }
};

// Actualizar marca (solo admin)
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, slug } = req.body;

    const updatedBrand = await Brand.findByIdAndUpdate(id, { name, logoUrl, slug }, { new: true });

    if (!updatedBrand) {
      return res.status(404).json({ message: 'Marca no encontrada.' });
    }

    res.status(200).json(updatedBrand);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la marca', error: err.message });
  }
};

// Eliminar marca (solo admin)
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) {
      return res.status(404).json({ message: 'Marca no encontrada.' });
    }

    res.status(200).json({ message: 'Marca eliminada.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la marca', error: err.message });
  }
};