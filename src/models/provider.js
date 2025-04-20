import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  code: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;