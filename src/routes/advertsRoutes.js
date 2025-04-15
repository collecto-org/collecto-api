import express from 'express';
import upload from '../utils/upload.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyAdvertOwner from '../middlewares/verifyAdvertOwner.js';
import {
  getAllAdverts,
  getAdvertBySlug,
  searchAdverts,
  // getAdvertStatusBySlug,
  updateAdvertStatus,
  uploadImages,
  getImages,
  createAdvert,
  editAdvert,
  deleteAdvert
} from '../controllers/advertsController.js';


const router = express.Router();

// Anuncios
router.get('/', getAllAdverts); // Obtener todos los anuncios
router.get('/:slug', getAdvertBySlug); // Detalles del anuncio
router.get('/search', searchAdverts); // Filtro de anuncios
// router.get('/:slug/status', getAdvertStatusBySlug); // Ver estado del anuncio       // MARECADO PARA BORRAR
// Ver anuncios de un usuario específico se encuentra en usersRoutes.js
router.patch('/:id/status', verifyToken, updateAdvertStatus);  // Cambiar estado y visibilidad del anuncio
router.post('/:id/picture', verifyToken, upload, uploadImages); // Subir imagenes
router.get('/:id/picture', getImages); // Ver imágenes de un anuncio


// Gestión de usuarios
router.post('/', verifyToken, upload, createAdvert); // Crear nuevo anuncio
router.put('/:id', verifyToken, verifyAdvertOwner, editAdvert);  // Editar anuncio
router.delete('/:id', verifyToken, verifyAdvertOwner, deleteAdvert); // Eliminar anuncio



export default router;
