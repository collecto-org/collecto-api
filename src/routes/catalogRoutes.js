import express from 'express';
import { getAllCatalogsHandler } from '../controllers/catalogController.js';

const router = express.Router();

router.get('/', getAllCatalogsHandler);

export default router;
