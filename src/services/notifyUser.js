import { connectedUsers, io } from "../server";


export async function notifyUser(userId, notificacion) {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit("notification", notificacion);
  } else {
    console.log("Notificar por correo")
  }
}