import express from 'express';
import { getAllConditions } from '../controllers/conditionController.js';

const router = express.Router();

router.get('/', getAllConditions); // Condiciones del producto

export default router;
