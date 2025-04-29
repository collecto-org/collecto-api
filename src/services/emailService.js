import nodemailer from 'nodemailer';

export const sendNotificationEmail = async (userId, advert) => {
  try {
    const user = await User.findById(userId);
    
    // Configura el correo
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
      subject: 'Nuevo anuncio que coincide con tu búsqueda',
      html: `
        <h3>Nuevo anuncio: ${advert.title}</h3>
        <p>Descripción: ${advert.description}</p>
        <p>Precio: ${advert.price}</p>
        <a href="${process.env.FRONTEND_URL}/advert/${advert.slug}">Ver anuncio</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error al enviar el correo:', err.message);
  }
};
