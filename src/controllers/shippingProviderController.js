import ShippingProvider from '../models/shippingProvider.js';

// Ver los proveedores de envío disponibles
export const getAllShippingProviders = async (req, res) => {
  try {
    const providers = await ShippingProvider.find({ active: true });

    if (!providers.length) {
      return res.status(404).json({ message: 'No hay proveedores de envío disponibles' });
    }

    res.status(200).json(providers);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los proveedores de envío', error: err.message });
  }
};

// Crear nuevo proveedor de envío (solo admin)
export const createShippingProvider = async (req, res) => {
  try {
    const { code, label, trackingUrl, apiIntegration } = req.body;

    const existingProvider = await ShippingProvider.findOne({ code });
    if (existingProvider) {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese código.' });
    }

    const newProvider = new ShippingProvider({ code, label, trackingUrl, apiIntegration });
    await newProvider.save();

    res.status(201).json(newProvider);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el proveedor de envío', error: err.message });
  }
};

// Actualizar proveedor de envío (solo admin)
export const updateShippingProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, label, trackingUrl, apiIntegration } = req.body;

    const updatedProvider = await ShippingProvider.findByIdAndUpdate(
      id,
      { code, label, trackingUrl, apiIntegration },
      { new: true }
    );

    if (!updatedProvider) {
      return res.status(404).json({ message: 'Proveedor de envío no encontrado.' });
    }

    res.status(200).json(updatedProvider);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el proveedor de envío', error: err.message });
  }
};

// Eliminar proveedor de envío (solo admin)
export const deleteShippingProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProvider = await ShippingProvider.findByIdAndDelete(id);
    if (!deletedProvider) {
      return res.status(404).json({ message: 'Proveedor de envío no encontrado.' });
    }

    res.status(200).json({ message: 'Proveedor de envío eliminado.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el proveedor de envío', error: err.message });
  }
};
