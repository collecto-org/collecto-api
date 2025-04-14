import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createShipment,
  getShipmentDetails,
  updateShipmentStatus,
  addToShipmentHistory,
  getShipmentHistory
} from '../controllers/shipmentController.js';

const router = express.Router();

router.post('/', verifyToken, createShipment); // Crear un envío
router.get('/me/:id', verifyToken, getShipmentDetails);  // Obtener detalles del envío
router.patch('/me/:id/status', verifyToken, updateShipmentStatus); // Actualizar estado del envío
router.post('/history', addToShipmentHistory); // Agregar actualización al historial de envío
router.patch('/me/:id/status', verifyToken, updateShipmentStatus); // Actualizar estado del envío
router.get('/me/:id/history', verifyToken, getShipmentHistory); // Ver historial de actualizaciones


export default router;