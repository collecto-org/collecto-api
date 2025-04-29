
import User from "../models/user.js";
import Advert from "../models/advert.js";
import Chat from "../models/chat.js";
import { Server } from "socket.io";


const connectedUsers = new Map(); 

export const initSocket = (server) => {

const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 4000,
  },
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"], 
    credentials: true,
  },
});

io.on("connection", (socket) => {
  
  socket.on("register",async (username) => {
    const user = await User.findOne({username})
    if(user){
    connectedUsers.set(user.id, socket.id);}    
  });

  socket.on("joinRoom", async ({ roomId, user }) => {
    try {
      const [advertId, buyerUsername] = roomId.split("_");
      const buyer = await User.findOne({ username: buyerUsername });
      const advert = await Advert.findById(advertId);
      const owner = await User.findById(advert.user._id);

      let chatRoom = await Chat.findOne({
        advertId,
        users: { $all: [buyer.id, owner.id] },
      });

      if (!chatRoom) {
        // Crear nueva sala de chat
        chatRoom = new Chat({
          advertId,
          roomId,
          users: [buyer._id, owner._id],
          messages: [], 
        });

        await chatRoom.save();
        console.log("Sala de chat creada: ", chatRoom);
      }

      if (chatRoom) { // Cargar mensajes previos
        await chatRoom.populate("messages.sender", "username");
      
        const formattedMessages = chatRoom.messages.map((msg) => ({
          username: msg.sender.username,
          message: msg.content,
        }));
      
        socket.emit("previousMessages", formattedMessages);
      
      } else {
        socket.emit("previousMessages", []);
      }

      socket.join(roomId);
      console.log(`Usuario ${user} unido a la sala ${roomId}`);
    } catch (error) {
      console.log("Error al crear el chat", error);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log("Usuario desconectado");
  });

  socket.on("chat message", async (msg) => {
    try {
      const { roomId, message, username } = msg;
      const [advertId, buyerUsername] = roomId.split("_");
      const buyer = await User.findOne({ username: buyerUsername });
      const advert = await Advert.findById(advertId);
      const owner = await User.findById(advert.user._id);

      let sender;
      if (username === buyer.username) {
        sender = buyer._id; // El comprador envio el mensaje
      } else {
        sender = owner._id; // El dueño envio el mensaje
      }

      let chatRoom = await Chat.findOne({
        advertId,
        users: { $all: [buyer.id, owner.id] },
      });

      if (chatRoom) {
        chatRoom.messages.push({
          sender,
          content: message,
        });
        await chatRoom.save();

        io.to(roomId).emit("chat message", {
          roomId,
          message,
          username,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.log("error al enviar el mensaje", error);
    }
  });
});
return { io, connectedUsers }
}
