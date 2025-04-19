import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String, required: true },
  slug: { type: String, required: false },
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
