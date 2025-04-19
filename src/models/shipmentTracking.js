import mongoose from 'mongoose';

const shipmentTrackingSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  providerName: { type: String, required: true },
  trackingCode: { type: String, required: true },
  currentStatus: { type: String },
  estimatedDate: { type: Date },
  deliveredAt: { type: Date },
  history: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const ShipmentTracking = mongoose.model('ShipmentTracking', shipmentTrackingSchema);

export default ShipmentTracking;
