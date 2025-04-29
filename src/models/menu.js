import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  label: { type: String, required: true },
  icon: { type: String },
  route: { type: String, required: true },
  menuGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuGroup', required: true },
  order: { type: Number },
  isActive: { type: Boolean, required: true, default: true }
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
