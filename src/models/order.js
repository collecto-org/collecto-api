import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  advertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advert', required: true },
  price: { type: Number, required: true },
  commission: { type: Number, required: false },
  paymentStatus: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true }, //
  paymentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: false }, 
  shippingMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingMethod', required: true }, //
  shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false },
  trackingCode: { type: String, required: false },
  notes: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, required: false },
});


// Excluir los campos sensibles en el método toJSON
orderSchema.methods.toJSON = function () {
  const order = this.toObject();

  // Eliminar los campos sensibles
  delete order.buyerId;
  delete order.sellerId;

  return order;
};


const Order = mongoose.model('Order', orderSchema);

export default Order;