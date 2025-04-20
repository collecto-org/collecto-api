import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippingProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingProvider', required: true },
  trackingCode: { type: String, required: true },
  currentStatus: { type: String},
  estimatedDate: { type: Date },
  deliveredAt: { type: Date, required: false },
  history: [{ type: mongoose.Schema.Types.Mixed }],
  trackingUrl: { type: String },
}, { timestamps: true });

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;