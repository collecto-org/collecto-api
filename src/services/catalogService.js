import Status from '../models/status.js';
import Transaction from '../models/transaction.js';
import ProductType from '../models/productType.js';
import Universe from '../models/universe.js';
import Condition from '../models/condition.js';
import Brand from '../models/brand.js';

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
    statuses,       // ← YA NO USAMOS arrayToMap
    transactions,
    productTypes,
    universes,
    conditions,
    brands,
  };
};
