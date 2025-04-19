import express from 'express';
import { createOrUpdateShipmentTracking, getShipmentTracking } from '../controllers/shipmentTrackingController.js';

const router = express.Router();

router.post('/update', createOrUpdateShipmentTracking); // Actualizar o crear un tracking
router.get('/:orderId', getShipmentTracking); // Obtener el tracking

export default router;
