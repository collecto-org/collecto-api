import slugify from 'slugify';
import mongoose from 'mongoose';

const advertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  mainImage: { type: String, required: true },
  price: { type: Number, required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true },
  isVisible: { type: Boolean, default: true },
  product_type: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductType', required: true },
  universe: { type: mongoose.Schema.Types.ObjectId, ref: 'Universe', required: true },
  condition: { type: mongoose.Schema.Types.ObjectId, ref: 'Condition', required: true },
  collectionref: { type: String },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  tags: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  images: [String],
});

// Limpia datos sensibles del usuario al convertir el anuncio a JSON
advertSchema.methods.toJSON = function () {
  const advert = this.toObject();

  if (advert.user && typeof advert.user === 'object') {
    delete advert.user._id;
    delete advert.user.passwordHash;
    delete advert.user.emailVerified;
    delete advert.user.isAdmin;
    delete advert.user.favorites;
    delete advert.user.createdAt;
    delete advert.user.bio;
    delete advert.user.gender;
    delete advert.user.location;
    delete advert.user.phone;
    delete advert.user.role;
    delete advert.user.email;
  }

  return advert;
};

const Advert = mongoose.model('Advert', advertSchema);
export default Advert;
