import mongoose from 'mongoose';

const universeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
});

const Universe = mongoose.model('Universe', universeSchema);
export default Universe;
