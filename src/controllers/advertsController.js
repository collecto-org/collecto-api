import Advert from '../models/advert.js';
import Notification from '../models/notification.js';
import NotificationType from '../models/notificationTypes.js';
import Status from '../models/status.js';
import User from '../models/user.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Sacar todos los anuncios (con pag y filtros)
export const getAllAdverts = async (req, res) => {
  try {

    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query; 

    const adverts = await Advert.find()
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

      const totalAdverts = await Advert.countDocuments(); // Consulta del total de anuncios disponibles

    // Si el usuario está autenticado, indica si el anuncio es favorito
      if (req.user) {  // Si el usuario está autenticado
        const user = await User.findById(req.user);
        const favorites = user.favorites.map(id => id.toString());
  
        const advertsWithFavStatus = adverts.map(advert => ({
          ...advert.toObject(),
          isFavorite: favorites.includes(advert._id.toString()) 
        }));

    // Verificar si no hay anuncios
    if (!advertsWithFavStatus.length) {
      return res.status(404).json({ message: 'No se encontraron anuncios' });
    }

    // Enviar los anuncios con la propiedad `isFavorite`
    return res.status(200).json({
      total: totalAdverts, // Total de anuncios disponibles
      adverts: advertsWithFavStatus, // Anuncios con el estado de favoritos
    });
  }

  if (!req.user) {
    const advertsWithoutFavStatus = adverts.map(advert => ({
      ...advert.toObject(),
    }));

    return res.status(200).json({
      total: totalAdverts, // Total de anuncios disponibles
      adverts: advertsWithoutFavStatus, // Anuncios sin el estado de favoritos
    });
  }

} catch (err) {
  res.status(500).json({ message: 'Error al obtener anuncios', error: err.message, stack: err.stack });
}
};


// Detalle de un anuncio
export const getAdvertBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const advert = await Advert.findOne({ slug })
      .populate('user', 'username avatar');

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    const advertWithImages = {
      ...advert.toObject(),
      images: advert.images.map(imagePath => path.basename(imagePath))
    };

    if (req.user) {
      const user = await User.findById(req.user);
      const isFavorite = user.favorites.includes(advert._id);
      advertWithImages.isFavorite = isFavorite;
    }

    res.status(200).json(advertWithImages);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el anuncio', error: err.message });
  }
};


// Filtro de anuncios
export const searchAdverts = async (req, res) => {
  try {
    const {
      title,
      priceMin,
      priceMax,
      tags,
      status,
      transaction,
      collection,
      createdAtMin,
      createdAtMax,
      brand,
      product_type,
      universe,
      condition,
      slug,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = -1,
    } = req.query;

    const query = {};

    if (title) query.title = { $regex: title, $options: 'i' };
    if (priceMin || priceMax) query.price = { $gte: Number(priceMin), $lte: Number(priceMax) };
    if (tags) query.tags = { $in: tags.split(',') };
    if (status) query.status = status;
    if (transaction) query.transaction = transaction;
    if (collection) query.collection = collection;
    if (brand) query.brand = brand;
    if (product_type) query.product_type = product_type;
    if (universe) query.universe = universe;
    if (condition) query.condition = condition;
    if (createdAtMin || createdAtMax) {
      query.createdAt = {};
      if (createdAtMin) query.createdAt.$gte = new Date(createdAtMin);
      if (createdAtMax) query.createdAt.$lte = new Date(createdAtMax);
    }
    if (slug) query.slug = { $regex: slug, $options: 'i' };

    const adverts = await Advert.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ [sortBy]: sortOrder });

    if (!adverts.length) {
      return res.status(404).json({ message: 'No se encontraron anuncios' });
    }

    if (req.user) {
      const user = await User.findById(req.user._id);
      const favorites = user.favorites.map(id => id.toString());

      const advertsWithFavStatus = adverts.map(advert => ({
        ...advert.toObject(),
        isFavorite: favorites.includes(advert._id.toString()),
      }));

      return res.status(200).json({ adverts: advertsWithFavStatus });
    }

    res.status(200).json({ adverts });
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar anuncios', error: err.message });
  }
};



// MARCADO PARA BORRAR

// Estado del anuncio (por slug)
//export const getAdvertStatusBySlug = async (req, res) => {
//  const { slug } = req.params;
//  try {
//    const advert = await Advert.findOne({ slug }).select('status');
//    if (!advert) {
//      return res.status(404).json({ message: 'Anuncio no encontrado' });
//    }
//    res.status(200).json({ estado: advert.status });
//  } catch (err) {
//    res.status(500).json({ message: 'Error al obtener el estado del anuncio', error: err.message });
//  }
//};


// Actualizar estado y visibilidad
export const updateAdvertStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;  // Estado

  try {
    const statusObj = await Status.findOne({ code: status });

    if (!statusObj) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    // Busca el anuncio por ID
    const advert = await Advert.findById(id);
    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    advert.status = statusObj._id;
    
    // Cambiar visibilidad
    if (status === 'vendido') {
      advert.isVisible = false;
    } else if (status === 'disponible' || status === 'reservado') {
      advert.isVisible = true; 
    }

    await advert.save();

    const notificationType = await NotificationType.findOne({ code: status }); // Obtener tipo de notificación

    const message = `El anuncio "${advert.title}" ha cambiado su estado a ${status}.`;

    // Notificar a los usuarios si el anuncio está en favoritos
    const usersWithFavorite = await User.find({ 'favorites': advert._id });

    if (usersWithFavorite.length > 0) {
      usersWithFavorite.forEach(async (user) => {
        const newNotification = new Notification({
          user: user._id,
          notificationType: notificationType._id,
          advertId: advert._id,
          message,
          isRead: false,
        });
        await newNotification.save();
      });
    }

    res.status(200).json({
      message: `El estado del anuncio ha sido cambiado a ${advert.status} y su visibilidad ha sido actualizada.`,
      advert,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el estado del anuncio', error: err.message });
  }
};



// Subir imagen de un anuncio
export const uploadImages = async (req, res) => {
  const advertId = req.params.id;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No se han cargado imágenes' });
  }

  const imagePaths = req.files.map(file => file.path);  // Saca las rutas de las imágenes

  try {
    const advert = await Advert.findByIdAndUpdate(
      advertId,
      { $push: { images: { $each: imagePaths } } },  // mete las imágenes al array del anuncio
      { new: true }
    );

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    res.status(201).json({
      message: 'Imágenes subidas',
      images: imagePaths,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al subir las imágenes', error: err.message });
  }
};


// Ver todas las imágenes del un anuncio
export const getImages = async (req, res) => {
  const advertId = req.params.id;

  try {
    const advert = await Advert.findById(advertId);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    res.status(200).json({ images: advert.images });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las imágenes', error: err.message });
  }
};


// Crear nuevo anuncio (Endpoint de Gestión de usuario)
export const createAdvert = async (req, res) => {
  const {
    title,
    description,
    price,
    transaction,
    status,
    product_type,
    universe,
    condition,
    collection,
    brand,
    tags,
  } = req.body;
  const userId = req.user;

  let uploadedImages = [];

  try {
    if (!title || !description || !price || !transaction || !status || !product_type || !universe || !condition) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }

    // Al menos un tag
    if (tags && tags.length === 0) {
      return res.status(400).json({ message: 'Debe haber al menos un tag' });
    }

    // Guardar las rutas de las imágenes si se subieron (solo los nombres de los archivos)
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => file.filename); // Guardamos solo el nombre del archivo
    }

    // Crear el nuevo anuncio
    const newAdvert = new Advert({
      title,
      description,
      price,
      transaction,
      status: availableStatus._id,
      product_type,
      universe,
      condition,
      collection,
      brand,
      tags,
      user: userId,
      mainImage: req.files && req.files.length > 0 ? req.files[0].filename : '',
      images: uploadedImages,
    });

    await newAdvert.save();

    res.status(201).json({
      message: 'Anuncio creado',
      anuncio: newAdvert,
    });
  } catch (err) {
    // Si ocurre un error al crear el anuncio, eliminamos las imágenes subidas
    if (uploadedImages.length > 0) {
      uploadedImages.forEach(fileName => {
        // Eliminamos las imágenes del servidor
        fs.unlink(path.join(__dirname, '..', 'public', 'images', fileName), (err) => {
          if (err) {
            console.error(`Error al eliminar archivo: ${fileName}`, err);
          }
        });
      });
    }
    res.status(500).json({ message: 'Error al crear el anuncio', error: err.message });
  }
};


// Editar un anuncio propio (Endpoint de Gestión de usuario)
export const editAdvert = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    transaction,
    status,
    product_type,
    universe,
    condition,
    collection,
    brand,
    tags,
    images,
  } = req.body;

  let newImages = [];

  try {
    const advert = await Advert.findById(id);
    
    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (advert.status === 'vendido') {
      return res.status(400).json({ message: 'No se puede editar un anuncio ya vendido.' });
    }

    if (advert.user.toString() !== req.user) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio.' });
    }

    // Guardar las nuevas imágenes que se están subiendo
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => file.filename);
    }

    // Eliminar las imágenes antiguas que ya no están en el nuevo anuncio
    const imagesToDelete = advert.images.filter(image => !images.includes(image));
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach(imagePath => {
        fs.unlink(path.join(__dirname, '..', 'public', 'images', imagePath), (err) => {
          if (err) {
            console.error(`Error al eliminar archivo: ${imagePath}`, err);
          }
        });
      });
    }

    // Actualiza los campos
    advert.title = title || advert.title;
    advert.description = description || advert.description;
    advert.price = price || advert.price;
    advert.transaction = transaction || advert.transaction;
    advert.status = status || advert.status;
    advert.product_type = product_type || advert.product_type;
    advert.universe = universe || advert.universe;
    advert.condition = condition || advert.condition;
    advert.collection = collection || advert.collection;
    advert.brand = brand || advert.brand;
    advert.tags = tags || advert.tags;
    advert.images = images || advert.images;
    
    advert.updatedAt = Date.now();

    await advert.save();

    // Elimina las imágenes que ya no están en el anuncio si la edición tuvo éxito
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach(imagePath => {
        fs.unlink(path.join(__dirname, '..', 'public', 'images', imagePath), (err) => {
          if (err) {
            console.error(`Error al eliminar archivo: ${imagePath}`, err);
          }
        });
      });
    }

    // Se actualizan las imágenes del anuncio si la edición tuvo éxito
    if (newImages.length > 0) {
      advert.images.push(...newImages);
      await advert.save();
    }

    res.status(200).json({
      message: 'Anuncio actualizado',
      advert,
    });
  } catch (err) {
    // Si ocurre un error al editar el anuncio, eliminamos las imágenes subidas
    if (newImages.length > 0) {
      newImages.forEach(imagePath => {
        fs.unlink(path.join(__dirname, '..', 'public', 'images', imagePath), (err) => {
          if (err) {
            console.error(`Error al eliminar archivo nuevo: ${imagePath}`, err);
          }
        });
      });
    }
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el anuncio', error: err.message });
  }
};


// Borrar anuncio propio (Endpoint de Gestión de usuario)
export const deleteAdvert = async (req, res) => {
  const { id } = req.params;

  try {
    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    // Si el anuncio tiene imágenes, las elimina del servidor
    advert.images.forEach(imagePath => {
      fs.unlink(path.join(__dirname, '..', 'public', 'images', imagePath), (err) => {
        if (err) {
          console.error(`Error al eliminar archivo: ${imagePath}`, err);
        }
      });
    });

    // Eliminar el anuncio
    await Advert.findByIdAndDelete(id);

    res.status(200).json({ message: 'Anuncio eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al borrar el anuncio', error: err.message });
  }
};