import SavedSearch from '../models/savedSearch.js';
import Advert from '../models/advert.js';
import { sendNotificationEmail } from './emailService.js';

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
        for (const advert of adverts) {
          await sendNotificationEmail(search.userId, advert);
        }
      }
    }
  } catch (error) {
    console.error('Error al buscar coincidencias:', error.message);
  }
};
