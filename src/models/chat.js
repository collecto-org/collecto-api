import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  advertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advert', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);
