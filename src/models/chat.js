import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  advertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advert', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], //Array de users
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

// Métodos para filtrar datos sensibles antes de enviarlos
chatSchema.methods.toJSON = function() {
  const chat = this.toObject();

  // Eliminar los campos sensibles antes de enviarlos al cliente
  chat.users = chat.users.map(userId => userId.toString());  // Mostrar solo los ID de los usuarios
  chat.messages = chat.messages.map(msg => {
    msg.sender = {
      userId: msg.sender.toString(),
      username: msg.sender.username,
      avatar: msg.sender.avatar || 'default_avatar_url', // URL de avatar por defecto si no existe (pendiente de definir)
    };
    return msg;
  });
  return chat;
};



export default mongoose.model('Chat', chatSchema);