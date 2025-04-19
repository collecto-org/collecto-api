import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import advertsRoutes from './routes/advertsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import shippingProviderRoutes from './routes/shippingProviderRoutes.js';
import universeRoutes from './routes/universeRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import productTypeRoutes from './routes/productTypeRoutes.js';
import conditionRoutes from './routes/conditionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import shippingMethodRoutes from './routes/shippingMethodRoutes.js';


import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use('/api', statusRoutes); // Estado de las ordenes, anuncios y pagos
app.use('/api/orders', orderRoutes); // Ordenes de pedido
app.use('/api/payments', paymentRoutes); // Pagos
app.use('/api/shipments', shipmentRoutes); // Envíos
app.use('/api/shipping-providers', shippingProviderRoutes); // Proveedores de envío
app.use('/images', express.static(path.join(__dirname, 'public', 'images'))); // Servir imágenes estáticas


app.use('/api/universes', universeRoutes); // Universos
app.use('/api/brands', brandRoutes); // Marcas
app.use('/api/collections', collectionRoutes); // Colecciones
app.use('/api/product-types', productTypeRoutes); // Tipos de productos
app.use('/api/conditions', conditionRoutes); // Condiciones de los productos
app.use('/api/transactions', transactionRoutes);
app.use('/api/shippingMethods', shippingMethodRoutes);



// Ruta básica de prueba
app.get('/', (req, res) => { res.send('Servidor funcionando');});


// Swagger
const swaggerDocument = YAML.load('./swagger.yaml'); // Cargar el archivo YAML de Swagger

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Configurar Swagger UI


// Arrancar servidor
app.listen(PORT, () => {console.log(`Servidor escuchando en http://localhost:${PORT}`);});