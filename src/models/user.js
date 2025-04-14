import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
  bio: { type: String },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  isAdmin: { type: Boolean, default: false },
  direccionId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Direcciones' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Advert' }],
});

const User = mongoose.model('User', userSchema);
export default User;