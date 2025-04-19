import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: false },
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
