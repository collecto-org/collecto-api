import express from 'express';
import { verifyToken, loadUserIfAuthenticated } from '../middlewares/authMiddleware.js';
import {
  createOrder,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getAllUserOrders
} from '../controllers/orderController.js';


const router = express.Router();

router.post('/', verifyToken, loadUserIfAuthenticated, createOrder); // Crear una nueva orden
router.get('/:id', verifyToken, loadUserIfAuthenticated, getOrderDetails); // Obtener los detalles de una orden por su ID
router.patch('/:id/status', verifyToken, loadUserIfAuthenticated, updateOrderStatus); // Actualizar estado de la orden
router.delete('/:id', verifyToken, loadUserIfAuthenticated, cancelOrder); // Cancelar una orden
router.get('/user/me', verifyToken, loadUserIfAuthenticated, getAllUserOrders); // Ver todas las órdenes del usuario autenticado


export default router;
