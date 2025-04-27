import mongoose from 'mongoose';

const genderSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
});

const Gender = mongoose.model('Gender', genderSchema);
export default Gender;
