import bcrypt from 'bcrypt';
import User from '../../models/user.js';
import { logDetailedError } from '../../utils/logger.js';

// Obtener todos los usuarios
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash'); // No mandamos el password
    res.status(200).json(users);
  } catch (err) {
    logDetailedError(err, req, 'getAllUsers');
    res.status(500).json({ message: 'Error al obtener los usuarios', error: err.message });
  }
};

// Crear nuevo usuario
export const createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      bio,
      dateOfBirth,
      role,
      emailVerified,
      avatarUrl,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      location,
      bio,
      dateOfBirth,
      role,
      emailVerified,
      avatarUrl,
    });

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.passwordHash;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    logDetailedError(err, req, 'createUser');
    res.status(500).json({ message: 'Error al crear el usuario', error: err.message });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Nunca permitimos actualizar el password desde aquí
    delete updatedData.passwordHash;

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    logDetailedError(err, req, 'updateUser');
    res.status(500).json({ message: 'Error al actualizar el usuario', error: err.message });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario eliminado.' });
  } catch (err) {
    logDetailedError(err, req, 'deleteUser');
    res.status(500).json({ message: 'Error al eliminar el usuario', error: err.message });
  }
};
