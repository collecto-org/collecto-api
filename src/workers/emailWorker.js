import { sendVerificationEmail, sendRecoverPasswordEmail, sendResetConfirmationEmail, sendNotificationEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
import connectToRabbitMQ from '../jobs/emailQueue.js';

dotenv.config();

// Conectar a RabbitMQ y manejar los trabajos de la cola
const processEmailQueue = async () => {
  const { connection, channel } = await connectToRabbitMQ();

  // Procesar trabajos de la cola
  channel.consume('emailQueue', async (msg) => {
    if (msg) {
      const job = JSON.parse(msg.content.toString());
      console.log(`[emailWorker] Recibido: ${job.type}`, job.data);

      try {
        if (job.type === 'verifyEmail') {
          await sendVerificationEmail(job.data.to, job.data.token);
        } else if (job.type === 'recoverPassword') {
          await sendRecoverPasswordEmail(job.data.to, job.data.token);
        } else if (job.type === 'resetConfirmation') {
          await sendResetConfirmationEmail(job.data.to);
        } else if (job.type === 'searchMatchNotification') {
          await sendNotificationEmail(job.data.userId, job.data.advert);
        }
        channel.ack(msg);
      } catch (error) {
        console.error(`[emailWorker] Error al procesar el job: ${error.message}`);
        channel.nack(msg);
      }
    }
  });

  console.log('[emailWorker] Escuchando trabajos...');
};

processEmailQueue();
