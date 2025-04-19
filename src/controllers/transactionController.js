import Transaction from '../models/transaction.js';

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    if (!transactions.length) {
      return res.status(404).json({ message: 'No hay transacciones disponibles' });
    }

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las transacciones', error: err.message });
  }
};
