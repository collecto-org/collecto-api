import User from "../models/user.js";
import Advert from "../models/advert.js";
import Chat from "../models/chat.js";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken"; // Asegúrate de importar jwt

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

  io.use(async (socket, next) => {
    const { cookie: cookieHeader } = socket.handshake.headers;
    if (!cookieHeader) return next(new Error("No cookie found"));

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;
    if (!token) return next(new Error("No token found"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));
      socket.user = user; // Asignamos el usuario autenticado a socket
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    connectedUsers.set(socket.user._id.toString(), socket.id);


    socket.on("active in chat", ({ roomId }) => {
      const set = activeUsersInRoom.get(roomId) || new Set();
      set.add(socket.user.username); 
      activeUsersInRoom.set(roomId, set);
    });

    socket.on("inactive in chat", ({ roomId }) => {
      const set = activeUsersInRoom.get(roomId);
      if (set) {
        set.delete(socket.user.username); 
        if (set.size === 0) {
          activeUsersInRoom.delete(roomId);
        }
      }
    });

    socket.on("joinRoom", async ({ roomId }) => {
      try {
        const chatRoom = await Chat.findOne({ roomId });
    
        if (!chatRoom) {
          return socket.emit("error", "Sala no encontrada.");
        }
    
        const isUserInRoom = chatRoom.users.some(
          (u) => u.toString() === socket.user._id.toString()
        );
    
        if (!isUserInRoom) {
          return socket.emit("error", "No estás autorizado para unirte a esta sala.");
        }
    
        socket.join(roomId);
    
        const populatedChatRoom = await Chat.findOne({ roomId }).populate({
          path: "messages.sender",
          select: "username",
        });
    
        if (populatedChatRoom) {
          const formattedMessages = populatedChatRoom.messages.map((msg) => ({
            message: msg.content,
            username: msg.sender.username,
          }));
    
          socket.emit("previousMessages", formattedMessages);
        }
      } catch (error) {
        console.error("Error al unirse a la sala:", error);
        socket.emit("error", "Error del servidor.");
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.user._id.toString();
      connectedUsers.delete(userId);
      console.log(`User with ID ${userId} disconnected`);
    });

    socket.on("chat message", async (msg) => {
      try {
        const { roomId, message } = msg;
        const [advertId, buyerUsername] = roomId.split("_");
    
        const buyer = socket.user.username === buyerUsername
          ? socket.user
          : await User.findOne({ username: buyerUsername });
    
        const advert = await Advert.findById(advertId);
        const owner = await User.findById(advert.user._id);
    
        let sender;
        if (socket.user.username === buyer.username) {
          sender = buyer._id;
        } else {
          sender = owner._id;
        }
    
        let receiver;
        if (socket.user.username === buyer.username) {
          receiver = owner;
        } else {
          receiver = buyer;
        }
    
        let chatRoom = await Chat.findOne({
          advertId,
          users: { $all: [buyer._id, owner._id] },
        });
    
        if (!chatRoom) {
          return socket.emit("error", "No tienes permiso para enviar mensajes en esta sala.");
        }
    
        const isUserInRoom = chatRoom.users.some(
          (u) => u.toString() === socket.user._id.toString()
        );
    
        if (!isUserInRoom) {
          return socket.emit("error", "No estás autorizado para enviar mensajes en esta sala.");
        }
    
        if (!message || message.trim() === "") {
          return;
        }
    
        const activeUsers = activeUsersInRoom.get(roomId);
        const receiverIsActive = activeUsers?.has(receiver.username);
    
        chatRoom.messages.push({
          sender,
          receiver: receiver._id,
          content: message,
          isRead: receiverIsActive || false,
        });
        await chatRoom.save();
    
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
            select: "title ",
          })
          .lean();
    
        const receiverSocketId = connectedUsers.get(receiver._id.toString());
        const senderSocketId = connectedUsers.get(sender.toString());
    
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("chat message", populatedChatRoom);
        }
        if (senderSocketId) {
          io.to(senderSocketId).emit("chat message", populatedChatRoom);
        }
    
        io.to(roomId).emit("chat message", {
          roomId,
          message,
          username: socket.user.username,
          createdAt: new Date(),
        });
    
      } catch (error) {
        console.log("error al enviar el mensaje", error);
        socket.emit("error", "Error al enviar el mensaje.");
      }
    });
  });

  return { io, connectedUsers };
};
