import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createOrder,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getAllUserOrders
} from '../controllers/orderController.js';


const router = express.Router();

router.post('/', verifyToken, createOrder); // Crear una nueva orden
router.get('/:id', verifyToken, getOrderDetails); // Obtener los detalles de una orden por su ID
router.patch('/:id/status', verifyToken, updateOrderStatus); // Actualizar estado de la orden
router.delete('/:id', verifyToken, cancelOrder); // Cancelar una orden
router.get('/user/me', verifyToken, getAllUserOrders); // Ver todas las órdenes del usuario autenticado


export default router;
