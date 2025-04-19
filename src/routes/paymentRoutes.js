import express from 'express';
import { verifyToken, loadUserIfAuthenticated } from '../middlewares/authMiddleware.js';
import {
  initiatePayment,
  getPaymentDetails,
  getPaymentStatus,
  getMyPurchases,
  getMySales,
  confirmPayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', verifyToken, loadUserIfAuthenticated, initiatePayment); // Iniciar un pago
router.get('/:id', verifyToken, loadUserIfAuthenticated, getPaymentDetails); // Ver detalles de un pago
router.get('/status/:paymentId', verifyToken, loadUserIfAuthenticated, getPaymentStatus); // Consultar el estado del pago
router.get('/me/purchases', verifyToken, loadUserIfAuthenticated, getMyPurchases); // Ver las compras realizadas
router.get('/me/sales', verifyToken, loadUserIfAuthenticated, getMySales); // Ver las ventas realizadas
router.post('/confirmation', confirmPayment); // Confirmar un pago


export default router;
