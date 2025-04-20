import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  order: { type: Number, required: true }
});

const ProductType = mongoose.model('ProductType', productTypeSchema);

export default ProductType;