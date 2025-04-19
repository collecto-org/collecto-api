import express from 'express';
import { verifyToken, loadUserIfAuthenticated } from '../middlewares/authMiddleware.js';
import {
  createShipment,
  getShipmentDetails,
  updateShipmentStatus,
  addToShipmentHistory,
  getShipmentHistory
} from '../controllers/shipmentController.js';

const router = express.Router();

router.post('/', verifyToken, loadUserIfAuthenticated, createShipment); // Crear un envío
router.get('/me/:id', verifyToken, loadUserIfAuthenticated, getShipmentDetails);  // Obtener detalles del envío
router.patch('/me/:id/status', verifyToken, loadUserIfAuthenticated, updateShipmentStatus); // Actualizar estado del envío
router.post('/history', addToShipmentHistory); // Agregar actualización al historial de envío
router.patch('/me/:id/status', verifyToken, updateShipmentStatus); // Actualizar estado del envío
router.get('/me/:id/history', verifyToken, loadUserIfAuthenticated, getShipmentHistory); // Ver historial de actualizaciones


export default router;