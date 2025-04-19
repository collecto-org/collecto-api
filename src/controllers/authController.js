import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';


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
    bio, 
    direccionId 
  } = req.body;

  let avatarUrl;
  let uploadedAvatar = [];


  if (req.files && req.files.length > 0) {
    avatarUrl = req.files[0].path;
    uploadedAvatar = [avatarUrl];
  }

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

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
      html: `
        <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p> 
        <a href="http://localhost:3000/verify-email/${emailVerificationToken}">Verificar mi correo electrónico</a>
      `,
    };

    // Enviar el correo de verificación
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('Error al enviar el correo:', err);
        if (uploadedAvatar.length > 0) {
          uploadedAvatar.forEach(filePath => {
            fs.unlink(path.join(__dirname, '..', filePath), (err) => {
              if (err) console.error(`Error al eliminar archivo: ${filePath}`, err);
            });
          });
        }
        return res.status(500).json({ message: 'Error al enviar correo de verificación' });
      }

      console.log('Correo de verificación enviado:', info.response);

      // Generar el token JWT para autenticación
      const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      // ENVÍA EL TOKEN JWT COMO COOKIE HTTP-ONLY
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // la cookie expira en 1 hora
        sameSite: 'Strict',
      });

      // Responder después de enviar el correo
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
    if (uploadedAvatar.length > 0) {
      uploadedAvatar.forEach(filePath => {
        fs.unlink(path.join(__dirname, '..', filePath), (err) => {
          if (err) {
            console.error(`Error al eliminar archivo: ${filePath}`, err);
          }
        });
      });
    }
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

    // Redirige al frontend a una página de éxito
    res.redirect('http://localhost:3000/email-verified-success');  // Cambia esta URL quede al final!!

  } catch (error) {
    res.status(400).send('Token inválido o expirado');
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
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};



// Logout
export const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

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