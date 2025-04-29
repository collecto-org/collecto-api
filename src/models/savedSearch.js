import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: false },
  filters: { type: Object, required: true },
  notifyByEmail: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);

export default SavedSearch;
