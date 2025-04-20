import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: false },
  order: { type: Number, required: true }
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;