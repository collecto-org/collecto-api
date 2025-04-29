import mongoose from 'mongoose';

const menuGroupSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, required: true, default: true }
}, { timestamps: true });

const MenuGroup = mongoose.model('MenuGroup', menuGroupSchema);

export default MenuGroup;
