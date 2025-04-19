import Payment from '../models/payment.js';
import Order from '../models/order.js';
import Provider from '../models/provider.js';
import PaymentMethod from '../models/paymentMethod.js';



// Iniciar un pago
export const initiatePayment = async (req, res) => {
  const { orderId, paymentMethodID, amount, currency } = req.body;
  const userId = req.user;

  try {
    const order = await Order.findById(orderId).populate('advertId');
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Solo se puede realizar el pago de órdenes pendientes' });
    }

    const paymentMethod = await PaymentMethod.findById(paymentMethodID);
    if (!paymentMethod || !paymentMethod.active) {
      return res.status(400).json({ message: 'Método de pago no disponible' });
    }

    const provider = await Provider.findById(paymentMethod.providerId);
    if (!provider || !provider.active) {
      return res.status(400).json({ message: 'Pasarela de pago no disponible' });
    }

    const newPayment = new Payment({
      orderId,
      userId,
      providersId: provider._id,
      transactionId: 'temp_transaction_id',  // Este ID debe ser generado por la pasarela de pago
      statusId: 'pending',
      paymentMethodID,
      amount,
      currency,
    });

    await newPayment.save();

    const advert = order.advertId;
    advert.status = 'vendido';
    await advert.save();

    res.status(201).json({
      message: 'Compra realizada',
      pago: newPayment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar el proceso de compra', error: err.message });
  }
};


// Obtener detalles de un pago
export const getPaymentDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id)
      .populate('orderId', 'price status')
      .populate('providersId', 'code label')
      .populate('paymentMethodID', 'code label')
      .populate('statusId');

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.status(200).json({
      pago: payment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los detalles del pago', error: err.message });
  }
};


// Consultar estado de un pago
export const getPaymentStatus = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId).populate('statusId');

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.status(200).json({
      status: payment.statusId,
      message: `Pago procesado correctamente`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar el estado del pago', error: err.message });
  }
};


// Ver "Mis compras"
export const getMyPurchases = async (req, res) => {
  const userId = req.user;

  try {
    const payments = await Payment.find({ userId }).populate('orderId', 'advertId price');

    if (!payments.length) {
      return res.status(404).json({ message: 'No tienes compras realizadas' });
    }

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las compras', error: err.message });
  }
};

// Ver "Mis ventas"
export const getMySales = async (req, res) => {
  const userId = req.user;

  try {
    const sales = await Payment.find({ sellerId: userId }).populate('orderId', 'advertId price');

    if (!sales.length) {
      return res.status(404).json({ message: 'No has realizado ventas' });
    }

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las ventas', error: err.message });
  }
};


// Confirmación del pago
export const confirmPayment = async (req, res) => {
  const { paymentId, transactionId, paymentStatus } = req.body;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    if (payment.transactionId !== transactionId) {
      return res.status(400).json({ message: 'El transactionId no coincide' });
    }

    if (paymentStatus) {
      payment.statusId = paymentStatus;
    } else {
      return res.status(400).json({ message: 'Estado del pago no proporcionado' });
    }

    if (paymentStatus === 'succeeded') {
      payment.paidAt = new Date();
    }
    
    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (paymentStatus === 'succeeded') {
      order.paymentStatus = 'paid';
    } else if (paymentStatus === 'failed') {
      order.paymentStatus = 'failed';
    } else if (paymentStatus === 'cancelled') {
      order.paymentStatus = 'cancelled';
    }

    await order.save();

    res.status(200).json({ message: 'Pago confirmado y procesado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al confirmar el pago', error: err.message });
  }
};
