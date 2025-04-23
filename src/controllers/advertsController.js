import Advert from '../models/advert.js';
import Notification from '../models/notification.js';
import NotificationType from '../models/notificationTypes.js';
import Status from '../models/status.js';
import User from '../models/user.js';
//import { v2 as cloudinary } from 'cloudinary';
import cloudinary from '../config/cloudinaryConfig.js'


export const getAllAdverts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sortBy = 'createdAt' } = req.query;

    // Consulta para obtener anuncios
    const adverts = await Advert.find()
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('transaction')
      .populate('status')
      .populate('product_type')
      .populate('universe')
      .populate('condition')
      .populate('brand')
      .populate('user'); 

    const totalAdverts = await Advert.countDocuments(); // Consulta del total de anuncios disponibles

    // Comprobar si el usuario está autenticado
    const advertsWithFavStatus = []; // Inicializar el arreglo vacío

    for (const advert of adverts) {
      const advertObject = advert.toObject();

      // Mapear las imágenes de cada anuncio para usar Cloudinary
      const imagesWithUrls = Array.isArray(advertObject.images)
      ? advertObject.images.map(image =>
          cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })
        )
      : [];

      // Si el usuario está autenticado, añadir el estado de favorito
      if (req.user) {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const favorites = user.favorites.map(id => id.toString());

        const isFavorite = favorites.includes(advert._id.toString());
        advertsWithFavStatus.push({
          ...advertObject,
          images: imagesWithUrls,
          isFavorite
        });
      } else {
        advertsWithFavStatus.push({
          ...advertObject,
          images: imagesWithUrls,
        });
      }
    }

    // Verificar si no se encontraron anuncios
    if (advertsWithFavStatus.length === 0) {
      return res.status(404).json({ message: 'No se encontraron anuncios' });
    }

    return res.status(200).json({
      total: totalAdverts,
      adverts: advertsWithFavStatus,
    });
  } catch (err) {
    next(err); 
    res.status(500).json({ message: 'Error al obtener anuncios', error: err.message });
  }
};



// Detalle de un anuncio
export const getAdvertBySlug = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const advert = await Advert.findOne({ slug })
    .populate('transaction')
    .populate('status')
    .populate('product_type')
    .populate('universe')
    .populate('condition')
    .populate('brand')
    .populate('user'); 

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    const advertWithImages = {
      ...advert.toObject(),
      images: advert.images.map(imagePath => 
        cloudinary.url(imagePath, { fetch_format: 'auto', quality: 'auto' })
      ),
    };

    if (req.user) {
      const userId = req.user.id; 
      const user = await User.findById(userId);
      const favorites = user.favorites.map(id => id.toString()); 

      const isFavorite = favorites.includes(advert._id.toString());
      advertWithImages.isFavorite = isFavorite;
    }

    res.status(200).json(advertWithImages);
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener el anuncio', error: err.message });
  }
};



// Filtro de anuncios
export const searchAdverts = async (req, res, next) => {
  try {
    const {
      title,
      priceMin,
      priceMax,
      tags,
      status,
      transaction,
      collectionref,
      createdAtMin,
      createdAtMax,
      brand,
      product_type,
      universe,
      condition,
      slug,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = -1,
    } = req.query;

    const query = {};

    if (title) query.title = { $regex: title, $options: 'i' };
    if (priceMin || priceMax) query.price = { $gte: Number(priceMin), $lte: Number(priceMax) };
    if (tags) query.tags = { $in: tags.split(',') };
    if (status) query.status = status;
    if (transaction) query.transaction = transaction;
    if (collectionref) query.collectionref = collectionref;
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

    const totalAdverts = await Advert.countDocuments(query);

    const adverts = await Advert.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ [sortBy]: sortOrder })
      .populate('transaction')
      .populate('status')
      .populate('product_type')
      .populate('universe')
      .populate('condition')
      .populate('brand')
      .populate('user');

    if (!adverts.length) {
      return res.status(200).json({ message: 'No se encontraron anuncios', adverts: [], total: totalAdverts });
    }

    if (req.user) {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const favorites = user.favorites.map(id => id.toString());

      const advertsWithFavStatus = adverts.map(advert => ({
        ...advert.toObject(),
        images: advert.images.map(image => cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })),
        isFavorite: favorites.includes(advert._id.toString()),
      }));

      return res.status(200).json({ adverts: advertsWithFavStatus, total: totalAdverts });
    }

    const advertsWithoutFavStatus = adverts.map(advert => ({
      ...advert.toObject(),
      images: advert.images.map(image => cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })),
    }));

    res.status(200).json({ adverts: advertsWithoutFavStatus, total: totalAdverts });
  } catch (err) {
    next(err);
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
export const updateAdvertStatus = async (req, res, next) => {
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
    next(err);
    res.status(500).json({ message: 'Error al actualizar el estado del anuncio', error: err.message });
  }
};



// Subir imagen de un anuncio
export const uploadImages = async (req, res, next) => {
  const advertId = req.params.id;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No se han cargado imágenes' });
  }

  try {
    const imageUrls = req.body.imageUrls;

    const advert = await Advert.findByIdAndUpdate(
      advertId,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    res.status(201).json({
      message: 'Imágenes subidas correctamente',
      images: imageUrls,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al subir las imágenes', error: err.message });
  }
};


// Ver todas las imágenes del un anuncio
export const getImages = async (req, res, next) => {
  const advertId = req.params.id;

  try {
    const advert = await Advert.findById(advertId);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    res.status(200).json({ images: advert.images });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener las imágenes', error: err.message });
  }
};


// Crear nuevo anuncio (Endpoint de Gestión de usuario)
export const createAdvert = async (req, res, next) => {
  const {
    title,
    description,
    price,
    transaction,
    status,
    product_type,
    universe,
    condition,
    collectionref,
    brand,
    tags,
  } = req.body;
  const userId = req.user.id;

  const uploadedImages = req.body.imageUrls || [];

  try {
    if (!title || !description || !price || !transaction || !status || !product_type || !universe || !condition) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }

    if (tags && tags.length === 0) {
      return res.status(400).json({ message: 'Debe haber al menos un tag' });
    }

    const newAdvert = new Advert({
      title,
      description,
      price,
      transaction,
      status, 
      product_type,
      universe,
      condition,
      collectionref,
      brand,
      tags,
      user: userId,
      mainImage: uploadedImages.length > 0 ? uploadedImages[0] : '',
      images: uploadedImages,
    });

    await newAdvert.save();

    res.status(201).json({
      message: 'Anuncio creado',
      anuncio: newAdvert,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear el anuncio', error: err.message });
  }
};


// Editar un anuncio propio (Endpoint de Gestión de usuario)
export const editAdvert = async (req, res, next) => {
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
    collectionref,
    brand,
    tags,
    images,
  } = req.body;

  let newImages = req.body.imageUrls || [];

  try {
    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (advert.status === 'vendido') {
      return res.status(400).json({ message: 'No se puede editar un anuncio ya vendido.' });
    }

    if (advert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio.' });
    }

    // Eliminar imágenes no deseadas
    const imagesToDelete = advert.images.filter(image => !images.includes(image));
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach(imageUrl => {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        cloudinary.uploader.destroy(publicId, (err) => {
          if (err) {
            console.error(`Error al eliminar la imagen de Cloudinary: ${imageUrl}`, err);
          }
        });
      });
    }

    // Actualizar el anuncio
    advert.title = title || advert.title;
    advert.description = description || advert.description;
    advert.price = price || advert.price;
    advert.transaction = transaction || advert.transaction;
    advert.status = status || advert.status;
    advert.product_type = product_type || advert.product_type;
    advert.universe = universe || advert.universe;
    advert.condition = condition || advert.condition;
    advert.collectionref = collectionref || advert.collectionref;
    advert.brand = brand || advert.brand;
    advert.tags = tags || advert.tags;

    advert.images = newImages.length > 0 ? [...advert.images, ...newImages] : advert.images;

    advert.updatedAt = Date.now();

    await advert.save();

    res.status(200).json({
      message: 'Anuncio actualizado',
      advert,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar el anuncio', error: err.message });
  }
};



// Borrar anuncio propio (Endpoint de Gestión de usuario)
export const deleteAdvert = async (req, res, next) => {
  const { id } = req.params;

  try {
    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    if (advert.images && advert.images.length > 0) {
      advert.images.forEach(imageUrl => {
        const publicId = imageUrl.split('/').pop().split('.')[0];

        cloudinary.uploader.destroy(publicId, (err, result) => {
          if (err) {
            console.error(`Error al eliminar imagen de Cloudinary: ${imageUrl}`, err);
          }
        });
      });
    }

    // Eliminar el anuncio de la base de datos
    await Advert.findByIdAndDelete(id);

    res.status(200).json({ message: 'Anuncio eliminado' });
  } catch (err) {
    console.error(err);
    next(err);
    res.status(500).json({ message: 'Error al borrar el anuncio', error: err.message });
  }
};
