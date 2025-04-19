import express from 'express';
import { getAllShippingMethods } from '../controllers/shippingMethodController.js';

const router = express.Router();

router.get('/', getAllShippingMethods); // Métodos de envío

export default router;
