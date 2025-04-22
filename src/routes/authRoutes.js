import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadAvatarToCloudinary  } from '../utils/upload.js';
import {
  register,
  verifyRegisterEmail,
  login, logout,
  recoverPassword,
  verifyRecoverToken,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Autenticación y gestión de sesión
router.post('/register', register, uploadAvatarToCloudinary ); // Sign up
router.get('/verify-email/:token', verifyRegisterEmail); // Verificar el correo

router.post('/login', login);  // Login (con opción de "Recordar sesión")
router.post('/logout', logout);  // Logout

router.post('/recover', recoverPassword); // Recuperación de la pasword
router.post('/recover/:token', verifyRecoverToken); // Verificar token de recuperacion
router.post('/reset/:token', verifyToken, resetPassword); // Restablece la password

export default router;