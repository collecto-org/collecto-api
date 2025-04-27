import mongoose from 'mongoose';
import { string } from 'zod';

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: mongoose.Schema.Types.ObjectId, ref: 'Gender' },
  phone: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
  bio: { type: String },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  isAdmin: { type: Boolean, default: false },
  direccionId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Address' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Advert' }],
});

const User = mongoose.model('User', userSchema);
export default User;