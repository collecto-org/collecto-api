import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/adminMiddleware.js';
import {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

// Rutas públicas para obtener transacciones
router.get('/', getAllTransactions); // Mostrar todas las transacciones

// Rutas protegidas para administradores
router.post('/', verifyToken, verifyAdmin, createTransaction);  // Crear nueva transacción (solo admin)
router.put('/:id', verifyToken, verifyAdmin, updateTransaction);  // Actualizar transacción (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteTransaction);  // Eliminar transacción (solo admin)

export default router;
