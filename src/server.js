import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import advertsRoutes from './routes/advertsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos
connectDB();

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/api/auth', authRoutes); // Autenticación y gestión de sesión
app.use('/api/adverts', advertsRoutes); // Anuncios
app.use('/api/users', usersRoutes); // Gestión de usuarios
app.use('/api/orders', orderRoutes); // Ordenes de pedido
app.use('/api/payments', paymentRoutes); // Pagos
app.use('/api/shipments', shipmentRoutes); // Envíos





// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
