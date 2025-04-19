import express from 'express';
import { getNotificationTypes } from '../controllers/notificationTypesController.js';

const router = express.Router();

router.get('/notification-types', getNotificationTypes);

export default router;
