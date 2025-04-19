import express from 'express';
import { getAllUniverses } from '../controllers/universeController.js';

const router = express.Router();

router.get('/', getAllUniverses);

export default router;
