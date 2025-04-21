import Shipment from '../models/shipment.js';
import Order from '../models/order.js';
import ShippingProvider from '../models/shippingProvider.js';

// Crear un nuevo envío
export const createShipment = async (req, res) => {
  const { orderId, shippingProviderId, trackingCode, estimatedDate } = req.body;
  const userId = req.user.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Solo se puede crear un envío para órdenes pagadas' });
    }

    const shippingProvider = await ShippingProvider.findById(shippingProviderId);
    console.log('ShippingProviderId convertido a ObjectId:', shippingProviderId);

    if (!shippingProvider || !shippingProvider.active) {
      return res.status(400).json({ message: 'Proveedor de envío no disponible' });
    }

    const newShipment = new Shipment({
      orderId,
      shippingProviderId,
      trackingCode,
      currentStatus,
      estimatedDate,
      trackingUrl: shippingProvider.trackingUrl.replace("{code}", trackingCode),
    });

    await newShipment.save();

    res.status(201).json({
      message: 'Envío iniciado',
      shipment: newShipment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar el envío', error: err.message });
  }
};


// Obtener detalles del envío
export const getShipmentDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await Shipment.findById(id)
      .populate('orderId', 'price paymentStatus') // Detalles de la orden
      .populate('shippingProviderId', 'label trackingUrl');  // Detalles del proveedor

    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    res.status(200).json({
      shipment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los detalles del envío', error: err.message });
  }
};


// Actualizar estado del envío
export const updateShipmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['en tránsito', 'entregado', 'pendiente', 'cancelado'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado inválido. Los estados válidos son: "en tránsito", "entregado", "pendiente", "cancelado".' });
  }

  try {
    const shipment = await Shipment.findById(id);

    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }


    shipment.currentStatus = status;
    shipment.updatedAt = new Date();

    if (status === 'entregado') {
      shipment.deliveredAt = new Date();
    }

    await shipment.save();

    res.status(200).json({
      message: 'Estado del envío actualizado',
      shipment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el estado del envío', error: err.message });
  }
};



// Agregar actualización al historial de envío
export const addToShipmentHistory = async (req, res) => {
  const { shipmentId, status, details } = req.body;

  try {
    // Buscar el envío
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    // Crear nueva entrada de historial
    const newHistoryEntry = {
      status,
      date: new Date(),  // Se usa la fecha actual para la actualización
      details,
    };

    // Agregar la nueva entrada al historial
    shipment.history.push(newHistoryEntry);
    
    // Guardar el envío actualizado
    await shipment.save();

    res.status(201).json({
      message: 'Historial actualizado',
      shipment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el historial', error: err.message });
  }
};


// Obtener historial de actualizaciones del envío
export const getShipmentHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    res.status(200).json({
      history: shipment.history,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el historial del envío', error: err.message });
  }
};
