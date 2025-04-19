import express from 'express';
import { getAllCollections } from '../controllers/collectionController.js';

const router = express.Router();

router.get('/', getAllCollections);

export default router;
