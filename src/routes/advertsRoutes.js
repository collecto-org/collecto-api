import express from 'express';
import { uploadImagesToCloudinary } from '../utils/upload.js';  // Importar el middleware para subir imágenes
import { verifyToken, loadUserIfAuthenticated } from '../middlewares/authMiddleware.js';
import verifyAdvertOwner from '../middlewares/verifyAdvertOwner.js';
import {
  getAllAdverts,
  getAdvertBySlug,
  searchAdverts,
  // getAdvertStatusBySlug,
  updateAdvertStatus,
  // uploadImages,
  // getImages,
  createAdvert,
  editAdvert,
  deleteAdvert
} from '../controllers/advertsController.js';

const router = express.Router();

// Anuncios
router.get('/search', loadUserIfAuthenticated, searchAdverts); // Filtro de anuncios
router.get('/', loadUserIfAuthenticated, getAllAdverts); // Obtener todos los anuncios
router.get('/:slug', loadUserIfAuthenticated, getAdvertBySlug); // Detalles del anuncio
// router.get('/:slug/status', getAdvertStatusBySlug); // Ver estado del anuncio       // MARECADO PARA BORRAR

router.patch('/:id/status', verifyToken, updateAdvertStatus);  // Cambiar estado y visibilidad del anuncio
// router.post('/:id/picture', verifyToken, uploadImagesToCloudinary , uploadImages); // Subir imagenes
//router.get('/:id/picture', loadUserIfAuthenticated, getImages); // Ver imágenes de un anuncio

// Gestión de usuarios
router.post('/', verifyToken, uploadImagesToCloudinary, createAdvert);  // Crear nuevo anuncio
router.put('/:id', verifyToken, verifyAdvertOwner, uploadImagesToCloudinary, editAdvert);  // Editar anuncio
router.delete('/:id', verifyToken, verifyAdvertOwner, deleteAdvert);  // Eliminar anuncio

export default router;