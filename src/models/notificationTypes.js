import mongoose from 'mongoose';

const notificationTypeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String, required: false },
  template: { type: String, required: false },
  order: { type: Number, required: false },
  active: { type: Boolean, default: true },
});

const NotificationType = mongoose.model('NotificationType', notificationTypeSchema);
export default NotificationType;
