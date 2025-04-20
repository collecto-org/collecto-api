import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providersId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  transactionId: { type: String, required: true },
  statusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true },
  paymentMethodID: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  paidAt: { type: Date, required: false },
  receiptUrl: { type: String, required: false },
  rawResponse: { type: mongoose.Schema.Types.Mixed, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;