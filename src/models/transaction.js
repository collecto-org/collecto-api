import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  description: { type: String },
  slug: { type: String },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
