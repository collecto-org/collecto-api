import express from 'express';
import { getAllStatuses } from '../controllers/statusController.js';

const router = express.Router();

router.get('/statuses', getAllStatuses);

export default router;
