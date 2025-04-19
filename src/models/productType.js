import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
});

const ProductType = mongoose.model('ProductType', productTypeSchema);

export default ProductType;
