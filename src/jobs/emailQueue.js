import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config(); 

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
    const channel = await connection.createChannel();

    const queue = 'emailQueue';
    await channel.assertQueue(queue, { durable: true });

    console.log('[emailQueue] Conectado a RabbitMQ');
    return { connection, channel };

  } catch (error) {
    console.error('[emailQueue] Error al conectar con RabbitMQ:', error.message);
    throw error;
  }
};

export default connectToRabbitMQ;