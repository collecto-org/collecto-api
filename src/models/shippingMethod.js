import mongoose from 'mongoose';

const shippingMethodSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  order: { type: Number },
  active: { type: Boolean, default: true },
});

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

export default ShippingMethod;