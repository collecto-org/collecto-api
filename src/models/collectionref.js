import mongoose from 'mongoose';

const collectionrefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: false },
  order: { type: Number, required: true }
});

const Collectionref = mongoose.model('Collectionref', collectionrefSchema);

export default Collectionref;