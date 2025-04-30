import cron from 'node-cron';
import { matchSearchesToAdverts } from './searchMatcher.js';

// Ejecutar cada semana
cron.schedule('0 9 * * 1', async () => {
  console.log('Ejecutando cron job semanal...');
  await matchSearchesToAdverts();
});
