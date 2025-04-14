import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


// Sign up
export const register = async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    phone,
    location,
    avatarUrl,
    bio,
    direccionId
  } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      $or: [{ email }, { username }] // Ojo!!!!!! revisar si hay que añadir otro campo que no se repita!!!
    });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      location,
      avatarUrl,
      bio,
      direccionId,
    });

    // Token de verificación de email (expira en 1h)
    const emailVerificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Configurar el transportador de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Configura las opciones del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'Verificación de cuenta',
      text: `Haga clic en el siguiente enlace para verificar su correo: http://localhost:3000/api/auth/verify-email/${emailVerificationToken}`,
    };

    // Enviar el correo de verificación
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('Error al enviar el correo:', err);
        return res.status(500).json({ message: 'Error al enviar correo de verificación' });
      }
      console.log('Correo de verificación enviado:', info.response);
      
      // Responder solo después de enviar el correo correctamente
      res.status(201).json({
        message: 'Usuario registrado. Verifica tu correo para activarlo.',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
};


// Verificacion del correo electronico
export const verifyRegisterEmail = async (req, res) => {
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

    res.status(200).json({
      message: 'Correo electrónico verificado exitosamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (err) {
    res.status(400).json({ message: 'Token inválido' });
  }
};



// Login (con opcion de recordar sesión)
export const login = async (req, res) => {
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

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET, // ojo!!
      { expiresIn }
    );

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
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};



// Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("token");  // elimina la cookie del token JWT.

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al cerrar sesión', error: err.message });
  }
};



// Recuperación de contraseña
export const recoverPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Token de recuperacion de 1h
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Recuperación de contraseña',
      text: `Haga clic en el siguiente enlace para restablecer su contraseña: http://localhost:3000/api/auth/reset/${resetToken}`,
    };    

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({ message: 'Error al enviar correo', error: err.message });
      }
      res.status(200).json({ message: 'Correo de recuperación enviado' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al recuperar contraseña', error: err.message });
  }
};



// Verificar el token que recuipera la contraseña
export const verifyRecoverToken = async (req, res) => {
  const { token } = req.params;
 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Token de recuperación válido', userId: decoded.id });
  } catch (err) {
    res.status(400).json({ message: 'Token de recuperación inválido o expirado' });
  }
};



// Restablecer contraseña
export const resetPassword = async (req, res) => {
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
  

// Enviar correo de confirmación
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Contraseña restablecida',
      text: 'Su contraseña ha sido restablecida correctamente.',
    };
  
    // Usar await en vez de callback
    await transporter.sendMail(mailOptions);
  
    res.status(200).json({ message: 'Contraseña actualizada y correo de confirmación enviado' });
  
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: err.message });
  }  
};