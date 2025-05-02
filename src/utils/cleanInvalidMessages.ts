// src/utils/maintenance/cleanInvalidMessages.ts

import Chat from '../models/chat';

export async function cleanInvalidMessages() {
  try {
    const result = await Chat.updateMany(
      {},
      { $pull: { messages: { receiver: null } } }
    );

    console.log("Limpieza completada:");
    console.log(result); // muestra matchedCount y modifiedCount
  } catch (err) {
    console.error("Error al limpiar mensajes inválidos:", err.message);
  }
}
