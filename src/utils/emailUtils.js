import nodemailer from 'nodemailer';

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

/**
 * Envía una notificación por correo electrónico.
 * @param {string} toEmail - Correo del destinatario.
 * @param {string} message - Contenido del mensaje.
 */
export const sendEmailNotification = async (toEmail, message) => {
  if (!toEmail) {
    console.error(' No se proporcionó un correo de destino.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Nueva notificación de Collecto',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>¡Tienes una nueva notificación!</h2>
        <p>${message}</p>
        <p style="color: #888;">Este mensaje fue enviado automáticamente por Collecto.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email enviado a ${toEmail}`);
  } catch (err) {
    console.error('Error enviando correo:', err.message);
  }
};
