import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de nodemailer
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

// Funciones para enviar emails
export async function sendVerificationEmail(to, token) {
  const html = `
    <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
    <a href="${process.env.FRONTEND_URL}/verify-email/${token}">Verificar mi correo electrónico</a>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verificación de cuenta',
    html,
  });
}

export async function sendRecoverPasswordEmail(to, token) {
  const templatePath = path.join(__dirname, '../utils/emailTemplates/recover-password.html');
  let html = fs.readFileSync(templatePath, 'utf8');
  html = html.replace('{{link}}', `${process.env.FRONTEND_URL}/recover/${token}`);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Recuperación de contraseña',
    html,
  });
}

export async function sendResetConfirmationEmail(to) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Contraseña restablecida',
    text: 'Su contraseña ha sido restablecida correctamente.',
  });
}

export async function sendNotificationEmail(userId, advert) {
  const user = await User.findById(userId);
  if (!user || !user.email) return;

  const html = `
    <h3>Nuevo anuncio: ${advert.title}</h3>
    <p>Descripción: ${advert.description}</p>
    <p>Precio: ${advert.price}</p>
    <a href="${process.env.FRONTEND_URL}/advert/${advert.slug}">Ver anuncio</a>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Nuevo anuncio que coincide con tu búsqueda',
    html,
  });
}
