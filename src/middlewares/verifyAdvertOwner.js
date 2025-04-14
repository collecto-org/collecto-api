// Middleware para verificar que el usuario es el propietario del anuncio

import Advert from '../models/advert.js';

const verifyAdvertOwner = async (req, res, next) => {
  const { id } = req.params;

  try {
    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (advert.user.toString() !== req.user) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Error al verificar la propiedad del anuncio', error: err.message });
  }
};

export default verifyAdvertOwner;
