import mongoose from 'mongoose';

const shippingProviderSchema = new mongoose.Schema({
  code: { type: String, required: true },
  label: { type: String, required: true },
  trackingUrl: { type: String },
  apiIntegration: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
});

const ShippingProvider = mongoose.model('ShippingProvider', shippingProviderSchema);

export default ShippingProvider;
