import express from 'express';

import { uploadAdvertsToCloudinary} from '../utils/upload.js';

import { verifyToken, loadUserIfAuthenticated } from '../middlewares/authMiddleware.js';
import verifyAdvertOwner from '../middlewares/verifyAdvertOwner.js';
import {
  getAllAdverts,
  getAdvertBySlug,
  searchAdverts,
  getAdvertOGView,
  // getAdvertStatusBySlug,
  updateAdvertStatus,
  uploadImages,
  getImages,
  createAdvert,
  editAdvert,
  deleteAdvert,
  getAdvertById
} from '../controllers/advertsController.js';

const router = express.Router();

// Anuncios
router.get('/search', loadUserIfAuthenticated, searchAdverts); // Filtro de anuncios
router.get('/', loadUserIfAuthenticated, getAllAdverts); // Obtener todos los anuncios
router.get('/:slug', loadUserIfAuthenticated, getAdvertBySlug); // Detalles del anuncio
router.get('/:id/id', loadUserIfAuthenticated, getAdvertById); // Detalles del anuncio
router.get("/og/:slug", getAdvertOGView); // detalle del anuncio con metadatos
// router.get('/:slug/status', getAdvertStatusBySlug); // Ver estado del anuncio       // MARECADO PARA BORRAR
// Ver anuncios de un usuario específico se encuentra en usersRoutes.js
router.patch('/:id/status', verifyToken, (req, res, next) => updateAdvertStatus(req, res, next, req.app.get('io'), req.app.get('connectedUsers'))); // Cambiar estado y visibilidad del anuncio

router.post('/:id/picture', verifyToken, uploadAdvertsToCloudinary, uploadImages); // Subir imagenes
router.get('/:id/picture', loadUserIfAuthenticated, getImages); // Ver imágenes de un anuncio

// Gestión de usuarios
router.post('/', verifyToken, uploadAdvertsToCloudinary, createAdvert); // Crear nuevo anuncio
router.put('/:id', verifyToken, verifyAdvertOwner, uploadAdvertsToCloudinary, (req, res, next) => editAdvert(req, res, next, req.app.get('io'), req.app.get('connectedUsers')));  // Editar anuncio


router.delete('/:id', verifyToken, verifyAdvertOwner, (req, res, next) => deleteAdvert(req, res, next, req.app.get('io'), req.app.get('connectedUsers')));

export default router;