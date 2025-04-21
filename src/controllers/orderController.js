import Order from '../models/order.js';
import Advert from '../models/advert.js';
import Status from '../models/status.js';
import ShippingMethod from '../models/shippingMethod.js';

// Crear una nueva orden
export const createOrder = async (req, res) => {
  const { advertId, shippingMethodId, shippingAddress } = req.body;
  const buyerId = req.user.id;
  try {
    const advert = await Advert.findById(advertId);
    if (!advert || advert.status !== 'disponible') {
      return res.status(400).json({ message: 'El anuncio no está disponible para compra' });
    }

    const sellerId = advert.user;
    if (buyerId === sellerId.toString()) {
      return res.status(400).json({ message: 'No puedes comprar tu propio anuncio' });
    }

    const shippingMethod = await ShippingMethod.findById(shippingMethodId);
    if (!shippingMethod || !shippingMethod.active) {
      return res.status(400).json({ message: 'Método de envío no válido' });
    }

    const newOrder = new Order({
      buyerId,
      sellerId,
      advertId,
      price: advert.price,
      shippingMethodId,
      shippingAddress: shippingMethod.code !== 'pickup' ? shippingAddress : null,
      commission: 0,
    });

    await newOrder.save();

    res.status(201).json({
      message: 'Orden creada',
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la orden', error: err.message });
  }
};

// Obtener detalles de una orden
export const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la orden por su ID
    const order = await Order.findById(id)
      .populate('buyerId', 'username')
      .populate('sellerId', 'username')
      .populate('advertId', 'title price')
      .populate('paymentStatus')
      .populate('shippingMethodId');

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.status(200).json({
      order,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los detalles de la orden', error: err.message });
  }
};


// Actualizar el estado de una orden
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const statusObj = await Status.findOne({ code: status });

    if (!statusObj) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.sellerId.toString() !== userId.toString() && status !== 'paid') {
      return res.status(403).json({ message: 'No tienes permiso para actualizar el estado de esta orden' });
    }

    order.paymentStatus = statusObj._id;
    order.updatedAt = new Date();

    await order.save();

    res.status(200).json({
      message: 'Estado de la orden actualizado',
      order,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el estado de la orden', error: err.message });
  }
};


// Cancelar una orden
export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Solo se pueden cancelar las órdenes en estado "pending"' });
    }

    if (order.buyerId.toString() !== userId.toString() && order.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para cancelar esta orden' });
    }

    const status = await Status.findOne({ code: 'cancelled' });

    if (!status) {
      return res.status(400).json({ message: 'Estado "cancelled" no encontrado' });
    }

    order.paymentStatus = status._id;
    order.updatedAt = new Date();

    await order.save();

    res.status(200).json({
      message: 'Orden cancelada',
      order,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al cancelar la orden', error: err.message });
  }
};


// Obtener todas las órdenes de un usuario autenticado
export const getAllUserOrders = async (req, res) => {
  const userId = req.user.id;
  const { orderId, page = 1, limit = 10 } = req.query;

  try {
    let filter = { $or: [{ buyerId: userId }, { sellerId: userId }] };

    if (orderId) {
      filter._id = orderId;
    }

    const orders = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('advertId', 'title price')
      .populate('buyerId', 'username')
      .populate('sellerId', 'username')
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(filter);

    if (!orders.length) {
      return res.status(404).json({ message: 'No tienes órdenes.' });
    }

    res.status(200).json({
      total: totalOrders,
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las órdenes', error: err.message });
  }
};
