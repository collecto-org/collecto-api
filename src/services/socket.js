
import User from "../models/user.js";
import Advert from "../models/advert.js";
import Chat from "../models/chat.js";
import { Server } from "socket.io";


const connectedUsers = new Map(); 
const activeUsersInRoom = new Map(); 

export const initSocket = (server) => {

const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 4000,
  },
  cors: {
    origin: process.env.FRONTEND_URL,
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
  socket.on("active in chat", ({ roomId, user }) => {
    const set = activeUsersInRoom.get(roomId) || new Set();
    set.add(user);
    activeUsersInRoom.set(roomId, set);
  });
  socket.on("inactive in chat", ({ roomId, user }) => {
    const set = activeUsersInRoom.get(roomId);
    if (set) {
      set.delete(user);
      if (set.size === 0) {
        activeUsersInRoom.delete(roomId);
      }
    }
  });

  socket.on("joinRoom", async ({ roomId, user }) => {
    try {
      const [advertId, buyerUsername] = roomId.split("_");
      const buyer = await User.findOne({ username: buyerUsername });
      const advert = await Advert.findById(advertId);
      const owner = await User.findById(advert.user._id);
      const currentUser = await User.findOne({ username: user })

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
      }

      if (chatRoom) { // Cargar mensajes previos
        await chatRoom.populate("messages.sender", "username");
        
        const receiverUser = await User.findById(currentUser);
        const receiverSocketId = connectedUsers.get(receiverUser._id.toString());

        chatRoom.messages.forEach((msg) => {
            if (
              msg.receiver.toString() === currentUser._id.toString() &&
              !msg.isRead
            ) {
              msg.isRead = true;
              socket.emit("message read", { roomId: chatRoom.roomId, messageIds:msg._id});

              if (receiverSocketId) {

                io.to(receiverSocketId).emit("message read",{ roomId: chatRoom.roomId, messageIds: msg._id.toString() });
              }

            }
          });
          await chatRoom.save();
      
        const formattedMessages = chatRoom.messages.map((msg) => ({
          username: msg.sender.username,
          message: msg.content,
          isRead: msg.isRead,
        }));
      
        socket.emit("previousMessages", formattedMessages);
      
      } else {
        socket.emit("previousMessages", []);
      }

      socket.join(roomId);
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

      let receiver
      if (username === buyer.username) {
        receiver = owner; 
      } else {
        receiver = buyer; 
      }


      let chatRoom = await Chat.findOne({
        advertId,
        users: { $all: [buyer.id, owner.id] },
      });
      const activeUsers = activeUsersInRoom.get(roomId);
        const receiverIsActive = activeUsers?.has(receiver.username);

      if (chatRoom) {
        chatRoom.messages.push({
          sender,
          receiver:receiver._id,
          content: message,
          isRead:receiverIsActive |false
        });
        await (chatRoom).save()
        const populatedChatRoom = await Chat.findById(chatRoom._id)
        .populate({
            path: "messages.sender",
            select: "username avatarUrl -_id",
          })
          .populate({
            path: "messages.receiver",
            select: "username -_id",
          })
          .populate({
            path: "users",
            select: "username avatarUrl -_id", 
          })
          .populate({
            path: "advertId",
            select: "title "
          })
          .lean();

        const receiverUser = await User.findById(receiver);
        const senderUser = await User.findById(sender);
        const receiverSocketId = connectedUsers.get(receiverUser._id.toString());
        const senderSocketId = connectedUsers.get(senderUser._id.toString());
 
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("chat message", populatedChatRoom);
         
        }
        if(senderSocketId){
          io.to(senderSocketId).emit("chat message", populatedChatRoom);
        }
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
