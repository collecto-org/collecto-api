import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import advertsRoutes from './routes/advertsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import statusRoutes from './routes/statusRoutes.js'; // Aqui está status
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import shippingProviderRoutes from './routes/shippingProviderRoutes.js';
import universeRoutes from './routes/universeRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import collectionrefRoutes from './routes/collectionrefRoutes.js';
import productTypeRoutes from './routes/productTypeRoutes.js';
import conditionRoutes from './routes/conditionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import shippingMethodRoutes from './routes/shippingMethodRoutes.js';
import shipmentTrackingRoutes from './routes/shipmentTrackingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import genderRoutes from './routes/genderRoutes.js';
import userRoutes from './routes/tableRoutes/userRoutes.js';


// import path from 'path';
// import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';



const app = express();
const PORT = process.env.PORT || 3000;

// Añado Socket.IO para gestionar las notificaciones en tiempo real
// Crear servidor HTTP para usar con Socket.IO
const server = http.createServer(app);

// Crear instancia de Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend
    credentials: true,
  },
});

// Mapa de usuarios conectados
const connectedUsers = new Map();

// Guardar io y connectedUsers en app para poder usarlos en las rutas
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Escuchar conexiones de socket
io.on('connection', (socket) => {
  console.log(' Usuario conectado a Socket.IO');

  socket.on('register', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(` Usuario ${userId} registrado con socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(` Usuario ${userId} desconectado`);
        break;
      }
    }
  });
});






dotenv.config();


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



// Conexión a la base de datos
connectDB();

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true})); // Habilitar CORS para el frontend en localhost:5173  (Ojo!! Cambiar a la URL de producción en el futuro)

app.use('/api/auth', authRoutes); // Autenticación y gestión de sesión
app.use('/api/adverts', advertsRoutes); // Anuncios
app.use('/api/users', usersRoutes); // Gestión de usuarios
app.use('/api/status', statusRoutes); // Estado de las ordenes, anuncios y pagos  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< STATUS
app.use('/api/orders', orderRoutes); // Ordenes de pedido
app.use('/api/payments', paymentRoutes); // Pagos
app.use('/api/shipments', shipmentRoutes); // Envíos
app.use('/api/shipping-providers', shippingProviderRoutes); // Proveedores de envío
// app.use('/images', express.static(path.join(__dirname, 'public', 'images'))); // Servir imágenes estáticas
app.use('/api/notifications', notificationRoutes);

app.use('/api/universes', universeRoutes); // Universos
app.use('/api/brands', brandRoutes); // Marcas
app.use('/api/collectionrefs', collectionrefRoutes); // Colecciones
app.use('/api/product-types', productTypeRoutes); // Tipos de productos
app.use('/api/conditions', conditionRoutes); // Condiciones de los productos
app.use('/api/transactions', transactionRoutes); // Transacciones de pago
app.use('/api/shippingMethods', shippingMethodRoutes); // Métodos de envío
app.use('/api/shipmentTracking', shipmentTrackingRoutes); // Tracking de envíos
app.use('/api/address', addressRoutes); // Direcciones
app.use('/api/genders', genderRoutes); // Generos
app.use('/api', userRoutes); // tabla de usuarios



// Ruta básica de prueba
app.get('/', (req, res) => { res.send('Servidor funcionando');});


// Swagger
const swaggerDocument = YAML.load('./swagger.yaml'); // Cargar el archivo YAML de Swagger

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Configurar Swagger UI



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


// Arrancar servidor HTTP + Socket.IO
server.listen(PORT, () => {
  console.log(` Servidor escuchando en http://localhost:${PORT}`);
});

