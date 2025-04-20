import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  context: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const Status = mongoose.model('Status', statusSchema);

export default Status;