import express from 'express';
import { getAllProductTypes } from '../controllers/productTypeController.js';

const router = express.Router();

router.get('/', getAllProductTypes); // Tipos de productos (cartas, figuras, etc.)

export default router;
