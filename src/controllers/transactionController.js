import Transaction from '../models/transaction.js';

// Ver las transacciones disponibles
export const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find();

    if (!transactions.length) {
      return res.status(404).json({ message: 'No hay transacciones disponibles' });
    }

    res.status(200).json(transactions);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener las transacciones', error: err.message });
  }
};

// Crear nueva transacción (solo admin)
export const createTransaction = async (req, res, next) => {
  try {
    const { transaction, description, slug } = req.body;

    const existingTransaction = await Transaction.findOne({ transaction });
    if (existingTransaction) {
      return res.status(400).json({ message: 'Ya existe una transacción con ese tipo.' });
    }

    const newTransaction = new Transaction({ transaction, description, slug });
    await newTransaction.save();

    res.status(201).json(newTransaction);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear la transacción', error: err.message });
  }
};

// Actualizar transacción (solo admin)
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transaction, description, slug } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { transaction, description, slug },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transacción no encontrada.' });
    }

    res.status(200).json(updatedTransaction);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar la transacción', error: err.message });
  }
};

// Eliminar transacción (solo admin)
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transacción no encontrada.' });
    }

    res.status(200).json({ message: 'Transacción eliminada.' });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al eliminar la transacción', error: err.message });
  }
};
