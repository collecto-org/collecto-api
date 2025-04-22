import express from 'express';
import { fetchCountries, fetchStates, fetchCities } from './controllers/addressController';

const router = express.Router();

router.get('/countries', fetchCountries); // Países
router.get('/states/:countryCode', fetchStates); // Estados
router.get('/cities/:stateCode', fetchCities); // Ciudades

export default router;
