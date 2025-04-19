import express from 'express';
import { getAllShippingProviders } from '../controllers/shippingProviderController.js';

const router = express.Router();

router.get('/', getAllShippingProviders);

export default router;
