import cron from 'node-cron';
import { matchSearchesToAdverts } from './searchMatcher.js';

// Ejecutar cada 10 minutos
cron.schedule('*/10 * * * *', async () => {
  console.log('Ejecutando cron job para buscar coincidencias...');
  await matchSearchesToAdverts();
});
