import mongoose from 'mongoose';

const conditionSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
});

const Condition = mongoose.model('Condition', conditionSchema);

export default Condition;
