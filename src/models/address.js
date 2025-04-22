import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, required: false }, // Casa, Oficina, etc.
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: false },
  typeOfStreet: { type: String, required: false }, // Calle, Avenida, etc.
  streetName: { type: String, required: true },
  streetNumber: { type: String, required: false },
  interior: { type: String, required: false }, // Piso, letra, etc.
  zoneType: { type: String, required: false }, // urbana, rural
  reference: { type: String, required: false },
  postalCode: { type: String, required: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true }, // FK a la ciudad
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true }, // FK a estado
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true }, // FK a país
  isDefault: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
