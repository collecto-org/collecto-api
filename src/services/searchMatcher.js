import connectToRabbitMQ from '../jobs/emailQueue.js';
import dotenv from 'dotenv';
dotenv.config();

export const matchSearchesToAdverts = async () => {
  try {
    const savedSearches = await SavedSearch.find({ active: true });

    for (const search of savedSearches) {
      const { filters, notifyByEmail } = search;

      const query = {};

      if (filters.priceMin || filters.priceMax) {
        query.price = {
          $gte: filters.priceMin || 0,
          $lte: filters.priceMax || Infinity,
        };
      }
      if (filters.title) query.title = { $regex: filters.title, $options: 'i' };
      if (filters.tags) query.tags = { $in: filters.tags.split(',') };

      const adverts = await Advert.find(query).where('isActive').equals(true);

      if (adverts.length > 0 && notifyByEmail) {
        const { connection, channel } = await connectToRabbitMQ(); // Esperamos que nos devuelvan el connection y el channel

        if (!channel) {
          console.error('Error: No se pudo obtener el canal de RabbitMQ.');
          return; // Si no se obtiene el canal, no continuamos
        }

        for (const advert of adverts) {
          try {
            console.log('Encolando notificación de nuevo anuncio para la búsqueda guardada');
            await channel.sendToQueue('emailQueue', Buffer.from(JSON.stringify({
              type: 'searchMatchNotification',
              data: {
                userId: search.userId,
                advert: {
                  title: advert.title,
                  description: advert.description,
                  price: advert.price,
                  slug: advert.slug,
                }
              }
            }), { persistent: true }));

            console.log('Mensaje encolado correctamente.');
          } catch (error) {
            console.error('Error al agregar job de búsqueda guardada:', error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al buscar coincidencias:', error.message);
  }
};
