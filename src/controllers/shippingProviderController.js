import ShippingProvider from '../models/shippingProvider.js';

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
