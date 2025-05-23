import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
import { uploadAvatarToCloudinary } from '../utils/upload.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logDetailedError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import emailQueue from '../jobs/emailQueue.js';
import connectToRabbitMQ from '../jobs/emailQueue.js';

// Sign up
export const register = async (req, res, next) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    phone,
    location,
    bio,
    direccionId,
    avatarUrl: avatarUrlFromBody
  } = req.body;

  let avatarUrl = avatarUrlFromBody || "";

  try {
    if (req.file) {
      const result = await uploadAvatarToCloudinary(req.file);
      avatarUrl = result.secure_url;
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      role: 'user',
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      location,
      avatarUrl,
      bio,
      direccionId,
    });

    const emailVerificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Conectarse a RabbitMQ y encolar el mensaje
    const { channel } = await connectToRabbitMQ();
    console.log('Encolando email de verificación...');
    await channel.sendToQueue('emailQueue', Buffer.from(JSON.stringify({
      type: 'verifyEmail',
      data: {
        to: newUser.email,
        token: emailVerificationToken,
      }
    }), { persistent: true }));
    console.log('Email encolado');

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'Strict',
    });

    res.status(201).json({
      message: 'Usuario registrado. Verifica tu correo para activarlo.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
      }
    });

  }  catch (err) {
      logDetailedError(err, req, 'getUserAdverts');
      res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
    }

  }




// Verificacion del correo electronico
export const verifyRegisterEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    // Verifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // verifica la base de datos
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // activa si es valido
    user.emailVerified = true;
    await user.save();
    return res.status(200).json({message: 'Usuario registrado'})

    // Redirige al frontend a una página de éxito
    const frontendUrl = process.env.FRONTEND_URL;
res.redirect(`${frontendUrl}/email-verified-success`);

  } catch (error) {
    logDetailedError(err, req, 'getUserAdverts');;
    res.status(400).send('Token inválido o expirado');
  }
};



// Login (con opcion de recordar sesión)
export const login = async (req, res, next) => {
  const { username, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // revisa si el mail está verificado
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Debe verificar su correo electrónico antes de iniciar sesión' });
    }

    // Verifica contraseña
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar JWT expiración de 30 días si se recuerda la sesión, 1h si no
    const expiresIn = rememberMe ? '30d' : '1h';
    // Genera el token JWT para autenticación
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn } // Expira según la opción de "remember me"
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn === '30d' ? 30 * 24 * 60 * 60 * 1000 : 3600000, // la cookie expira en 30 días o 1 hora (dependiendo de que marque la opción de recordar sesión)
      sameSite: 'Strict',
    });


    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });
  } catch (err) {
    logDetailedError(err, req, 'getUserAdverts');;
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};



// Logout
export const logout = (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    logDetailedError(err, req, 'getUserAdverts');;
    res.status(500).json({ message: 'Error al cerrar sesión', error: err.message });
  }
};



// Recuperación de contraseña
export const recoverPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Conectarse a RabbitMQ y encolar el mensaje
    const { channel } = await connectToRabbitMQ();
    await channel.sendToQueue('emailQueue', Buffer.from(JSON.stringify({
      type: 'recoverPassword',
      data: {
        to: user.email,
        token: resetToken,
      }
    }), { persistent: true }));

    res.status(200).json({ message: 'Correo de recuperación enviado' });

  } catch (err) {
    logDetailedError(err, req, 'getUserAdverts');;
    res.status(500).json({ message: 'Error al recuperar contraseña', error: err.message });
  }
};



// Verificar el token que recuipera la contraseña
export const verifyRecoverToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Token de recuperación válido', userId: decoded.id });
  } catch (err) {
    logDetailedError(err, req, 'getUserAdverts');;
    res.status(400).json({ message: 'Token de recuperación inválido o expirado' });
  }
};



// Restablecer contraseña
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.updatedAt = Date.now();
    await user.save();

    // Conectarse a RabbitMQ y encolar el mensaje
    const { channel } = await connectToRabbitMQ();
    await channel.sendToQueue('emailQueue', Buffer.from(JSON.stringify({
      type: 'resetConfirmation',
      data: {
        to: user.email,
      }
    }), { persistent: true }));

    res.status(200).json({ message: 'Contraseña actualizada y correo de confirmación enviado' });

  } catch (err) {
    console.log(err);
   logDetailedError(err, req, 'getUserAdverts');;
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: err.message });
  }
};

