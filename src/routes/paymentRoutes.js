import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  initiatePayment,
  getPaymentDetails,
  getPaymentStatus,
  getMyPurchases,
  getMySales,
  confirmPayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', verifyToken, initiatePayment); // Iniciar un pago
router.get('/:id', verifyToken, getPaymentDetails); // Ver detalles de un pago
router.get('/status/:paymentId', verifyToken, getPaymentStatus); // Consultar el estado del pago
router.get('/me/purchases', verifyToken, getMyPurchases); // Ver las compras realizadas
router.get('/me/sales', verifyToken, getMySales); // Ver las ventas realizadas
router.post('/confirmation', confirmPayment); // Confirmar un pago (Webhook de MercadoPago)


export default router;
