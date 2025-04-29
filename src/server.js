import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import advertsRoutes from "./routes/advertsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import statusRoutes from "./routes/statusRoutes.js"; // Aqui está status
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import shippingProviderRoutes from "./routes/shippingProviderRoutes.js";
import universeRoutes from "./routes/universeRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import collectionrefRoutes from "./routes/collectionrefRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import conditionRoutes from "./routes/conditionRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import shippingMethodRoutes from "./routes/shippingMethodRoutes.js";
import shipmentTrackingRoutes from "./routes/shipmentTrackingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import genderRoutes from "./routes/genderRoutes.js";
import userRoutes from "./routes/tableRoutes/userRoutes.js";

import { Server } from "socket.io";
import { createServer } from "node:http";

import cookieParser from "cookie-parser";
import cors from "cors";
// import path from 'path';
// import { fileURLToPath } from 'url';
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import User from "./models/user.js";
import Advert from "./models/advert.js";
import Chat from "./models/chat.js";

dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos
connectDB();

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Habilitar CORS para el frontend en localhost:5173  (Ojo!! Cambiar a la URL de producción en el futuro)

app.use("/api/auth", authRoutes); // Autenticación y gestión de sesión
app.use("/api/adverts", advertsRoutes); // Anuncios
app.use("/api/users", usersRoutes); // Gestión de usuarios
app.use("/api/status", statusRoutes); // Estado de las ordenes, anuncios y pagos  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< STATUS
app.use("/api/orders", orderRoutes); // Ordenes de pedido
app.use("/api/payments", paymentRoutes); // Pagos
app.use("/api/shipments", shipmentRoutes); // Envíos
app.use("/api/shipping-providers", shippingProviderRoutes); // Proveedores de envío
// app.use('/images', express.static(path.join(__dirname, 'public', 'images'))); // Servir imágenes estáticas
app.use("/api/notifications", notificationRoutes);

app.use("/api/universes", universeRoutes); // Universos
app.use("/api/brands", brandRoutes); // Marcas
app.use("/api/collectionrefs", collectionrefRoutes); // Colecciones
app.use("/api/product-types", productTypeRoutes); // Tipos de productos
app.use("/api/conditions", conditionRoutes); // Condiciones de los productos
app.use("/api/transactions", transactionRoutes); // Transacciones de pago
app.use("/api/shippingMethods", shippingMethodRoutes); // Métodos de envío
app.use("/api/shipmentTracking", shipmentTrackingRoutes); // Tracking de envíos
app.use("/api/address", addressRoutes); // Direcciones
app.use("/api/genders", genderRoutes); // Generos
app.use("/api", userRoutes); // tabla de usuarios

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Swagger
const swaggerDocument = YAML.load("./swagger.yaml"); // Cargar el archivo YAML de Swagger

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Configurar Swagger UI

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Mostrar solo errores detallados en entorno de desarrollo
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production";
  console.error("Error capturado por middleware:");
  console.error("Ruta:", req.method, req.originalUrl);
  if (isDev) {
    console.error("Headers:", req.headers);
    console.error("Body:", req.body);
    console.error("Error:", err.message);
    console.error("Stacktrace:\n", err.stack);
  }

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    ...(isDev && { error: err.stack }),
  });
});

//------------------------------------------------------

const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 4000,
  },
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado");

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

server.listen(4000, () => { // servidor de webSockets
  console.log("servidor de shockets escuchando en http://localhost:4000");
});