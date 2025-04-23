import ShippingMethod from '../models/shippingMethod.js';

// Ver los métodos de envío disponibles
export const getAllShippingMethods = async (req, res, next) => {
  try {
    const shippingMethods = await ShippingMethod.find({ active: true }).sort({ order: 1 });

    if (!shippingMethods.length) {
      return res.status(404).json({ message: 'No hay métodos de envío disponibles' });
    }

    res.status(200).json(shippingMethods);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los métodos de envío', error: err.message });
  }
};

// Crear nuevo método de envío (solo admin)
export const createShippingMethod = async (req, res, next) => {
  try {
    const { code, label, order, active } = req.body;

    const existingMethod = await ShippingMethod.findOne({ code });
    if (existingMethod) {
      return res.status(400).json({ message: 'Ya existe un método de envío con ese código.' });
    }

    const newMethod = new ShippingMethod({ code, label, order, active });
    await newMethod.save();

    res.status(201).json(newMethod);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear el método de envío', error: err.message });
  }
};

// Actualizar método de envío (solo admin)
export const updateShippingMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, label, order, active } = req.body;

    const updatedMethod = await ShippingMethod.findByIdAndUpdate(
      id,
      { code, label, order, active },
      { new: true }
    );

    if (!updatedMethod) {
      return res.status(404).json({ message: 'Método de envío no encontrado.' });
    }

    res.status(200).json(updatedMethod);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar el método de envío', error: err.message });
  }
};

// Eliminar método de envío (solo admin)
export const deleteShippingMethod = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedMethod = await ShippingMethod.findByIdAndDelete(id);
    if (!deletedMethod) {
      return res.status(404).json({ message: 'Método de envío no encontrado.' });
    }

    res.status(200).json({ message: 'Método de envío eliminado.' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar el método de envío', error: err.message });
  }
};
