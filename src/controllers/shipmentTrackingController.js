import ShipmentTracking from '../models/shipmentTracking.js';
import Order from '../models/order.js';
import { getTrackingInfo } from '../services/correosService.js';  // función de servicio para consultar Correos

// Crear o actualizar el seguimiento de un envío
export const createOrUpdateShipmentTracking = async (req, res) => {
  const {
    orderId,
    providerName,
    trackingCode,
    currentStatus,
    estimatedDate,
    deliveredAt,
    history
  } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    let shipment = await ShipmentTracking.findOne({ orderId });

    // Consultar la API de Correos para obtener el tracking
    const trackingInfo = await getTrackingInfo(trackingCode);

    if (trackingInfo) {
      currentStatus = trackingInfo.eventos[0].desTextoResumen || currentStatus;
      history = trackingInfo.eventos || history;
    }

    if (shipment) {
      shipment.currentStatus = currentStatus || shipment.currentStatus;
      shipment.estimatedDate = estimatedDate || shipment.estimatedDate;
      shipment.deliveredAt = deliveredAt || shipment.deliveredAt;
      shipment.history = history || shipment.history;
      shipment.updatedAt = new Date();
      
      await shipment.save();
    } else {
      shipment = new ShipmentTracking({
        orderId,
        providerName,
        trackingCode,
        currentStatus,
        estimatedDate,
        deliveredAt,
        history,
      });

      await shipment.save();
    }

    res.status(200).json({
      message: 'Seguimiento de envío actualizado correctamente',
      shipment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el seguimiento de envío', error: err.message });
  }
};

// Obtener detalles del seguimiento de un envío
export const getShipmentTracking = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const shipment = await ShipmentTracking.findOne({ orderId }).populate('orderId', 'price');

    if (!shipment) {
      return res.status(404).json({ message: 'Seguimiento de envío no encontrado' });
    }

    // Consultar la API de Correos para obtener el tracking
    const trackingInfo = await getTrackingInfo(shipment.trackingCode);

    if (trackingInfo) {
      shipment.currentStatus = trackingInfo.eventos[0].desTextoResumen;
      shipment.history = trackingInfo.eventos;
    }

    res.status(200).json({
      shipment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el seguimiento de envío', error: err.message });
  }
};