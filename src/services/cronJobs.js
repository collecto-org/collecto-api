import cron from 'node-cron';
import { matchSearchesToAdverts } from './searchMatcher.js';

// Ejecutar cada semana (lunes a las 9:00)
cron.schedule('0 9 * * 1', async () => {
  try {
    console.log('Ejecutando cron job semanal...');
    await matchSearchesToAdverts();
  } catch (error) {
    console.error('Error en el cron job semanal:', error.message);
  }
});
