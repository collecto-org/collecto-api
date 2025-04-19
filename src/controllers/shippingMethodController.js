import ShippingMethod from '../models/shippingMethod.js';

export const getAllShippingMethods = async (req, res) => {
  try {
    const shippingMethods = await ShippingMethod.find({ active: true }).sort({ order: 1 });

    if (!shippingMethods.length) {
      return res.status(404).json({ message: 'No hay métodos de envío disponibles' });
    }

    res.status(200).json(shippingMethods);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los métodos de envío', error: err.message });
  }
};
