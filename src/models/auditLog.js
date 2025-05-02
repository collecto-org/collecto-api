import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },  // "delete_account"
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  email: String,
  timestamp: { type: Date, default: Date.now },
  details: Object
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
