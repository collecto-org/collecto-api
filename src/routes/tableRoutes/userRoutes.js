import express from 'express';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import verifyAdmin from '../../middlewares/adminMiddleware.js';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/tablesControllers/userTableControlle.js';

const router = express.Router();

// Obtener todos los usuarios 
router.get('/users', getAllUsers);

// Crear un nuevo usuario 
router.post('/users', createUser);

// Actualizar un usuario existente 
router.put('/users/:id',  updateUser);

// Eliminar un usuario 
router.delete('/users/:id', deleteUser);

export default router;
