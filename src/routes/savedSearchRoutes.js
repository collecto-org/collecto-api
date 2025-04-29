import express from 'express';
import { saveSearch } from '../controllers/savedSearchController.js';

const router = express.Router();

router.post('/save', saveSearch); // Guardar una búsqueda

export default router;
