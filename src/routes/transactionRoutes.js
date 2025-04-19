import express from 'express';
import { getAllTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', getAllTransactions); // Transacciones compra o venta

export default router;
