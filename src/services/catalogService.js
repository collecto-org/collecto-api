import Status from '../models/status.js';
import Transaction from '../models/transaction.js';
import ProductType from '../models/productType.js';
import Universe from '../models/universe.js';
import Condition from '../models/condition.js';
import Brand from '../models/brand.js';

/**
 * Convierte un array de documentos de MongoDB a un mapa { [id]: objeto }
 */
const arrayToMap = (array) => {
  const map = {};
  array.forEach(item => {
    map[item._id.toString()] = item;
  });
  return map;
};

/**
 * Devuelve todos los catálogos cargados como mapas por ID
 */
export const getAllCatalogs = async () => {
  const [statuses, transactions, productTypes, universes, conditions, brands] = await Promise.all([
    Status.find(),
    Transaction.find(),
    ProductType.find(),
    Universe.find(),
    Condition.find(),
    Brand.find(),
  ]);

  return {
    statuses: arrayToMap(statuses),
    transactions: arrayToMap(transactions),
    productTypes: arrayToMap(productTypes),
    universes: arrayToMap(universes),
    conditions: arrayToMap(conditions),
    brands: arrayToMap(brands),
  };
};
