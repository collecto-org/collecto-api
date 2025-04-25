import Advert from '../models/advert.js';
import Status from '../models/status.js';
import User from '../models/user.js';
//import { v2 as cloudinary } from 'cloudinary';
import cloudinary from '../config/cloudinaryConfig.js'
import { extractPublicId } from '../utils/upload.js';
import { notifyStatusChange, notifyPriceChange, notifyAdvertDeleted  } from './notificationController.js'; ////////////////////////////////////////////////////////////

// Obtener todos los anuncios
export const getAllAdverts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const allowedSortFields = ['price', 'createdAt', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;

    const availableStatuses = await Status.find({ code: { $in: ['available', 'reserved'] } });

    const availableStatusIds = availableStatuses.map(status => status._id);

    const adverts = await Advert.find({ status: { $in: availableStatusIds } })
      .sort({ [sortField]: order })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('transaction')
      .populate('status')
      .populate('product_type')
      .populate('universe')
      .populate('condition')
      .populate('brand')
      .populate('user');

    const totalAdverts = await Advert.countDocuments({ status: { $in: availableStatusIds } });

    const advertsWithFavStatus = [];

    for (const advert of adverts) {
      const advertObject = advert.toObject();

      const imagesWithUrls = Array.isArray(advertObject.images)
        ? advertObject.images.map(image =>
            cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })
          )
        : [];

      if (req.user) {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const favorites = user.favorites.map(id => id.toString());

        const isFavorite = favorites.includes(advert._id.toString());
        advertsWithFavStatus.push({
          ...advertObject,
          images: imagesWithUrls,
          isFavorite,
        });
      } else {
        advertsWithFavStatus.push({
          ...advertObject,
          images: imagesWithUrls,
        });
      }
    }

    res.status(200).json({
      adverts: advertsWithFavStatus,
      total: totalAdverts,
    });

  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al obtener los anuncios', error: err.message });
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


export const getAdvertOGView = async (req, res, next) => {
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
      return res.status(404).send("Anuncio no encontrado");
    }

    const imageUrl = advert.images?.length
      ? cloudinary.url(advert.images[0], {
          fetch_format: 'auto',
          quality: 'auto',
        })
      : 'https://collecto.es/default-og-image.jpg'; // fallback

    const title = `${advert.title} por €${advert.price}`;
    const description = advert.description || "Artículo de colección disponible en Collecto";
    const canonicalUrl = `https://collecto.es/adverts/${slug}`;

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <meta name="description" content="${description}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:url" content="${canonicalUrl}" />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${imageUrl}" />
          <meta http-equiv="refresh" content="0; URL='${canonicalUrl}'" />
        </head>
        <body>
          <p>Redirigiendo a <a href="${canonicalUrl}">${canonicalUrl}</a>...</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Error generando metadatos OG:", err);
    res.status(500).send("Error interno al generar los metadatos OG.");
  }
};


// Filtro de anuncios
// Añado el parametro query para buscar palabras sueltas en el buscador.
// Cuando este endpoint se usa para filtrar anuncios, no se le pasa el parametro
// query pero si los demás (titulo, precios catalogos, etc).
// Cuando este endpoint se usa para busqueda global, solo utilizará el campo query.
// En busqueda global se pueden introducir más de una palabra.
// Si hay más de una, por ejemplo "Pikachu feliz", buscará "Pikachu feliz", "Pikachu"
// y "Feliz", aunque se le dará prioridad a mostrar primero los resultados que 
// coinciden con el nombre completo "Pikachu feliz".
// Nota extra: la frase completa solo la busca en titulos y descripciones. Pero las
// palabra sueltas las busca tambien en tags, tipò de producto, marca universo y condicionm.
// Revisar si son esos los que queremos o si de quieren más o menos.

export const searchAdverts = async (req, res, next) => {
  try {
    const {
      searchTerm,  // Busqueda general de palabras o frases
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

    const queryFilter = {};

    //INICIO DE LA LOGICA PARA BUSCAR EN EL BUSCADOR

    let advertsWithPriority = [];  // Anuncios con prioridad (frase exacta)
    let advertsWithoutPriority = [];  // Anuncios sin prioridad (palabras sueltas)

    if (searchTerm) {
      const keywords = searchTerm.split(' ');

      // Primero, buscar la frase completa (todas las palabras juntas)
      const fullQuery = searchTerm.trim();
      queryFilter.$or = [
        { title: { $regex: fullQuery, $options: 'i' } },
        { description: { $regex: fullQuery, $options: 'i' } }, 
      ]; //ojo, la frase completa solo la busca en titulos o en descripciones

      // Buscar por cada palabra por separado
      keywords.forEach(keyword => {
        queryFilter.$or.push(
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [keyword] } },
          { 'product_type.name': { $regex: keyword, $options: 'i' } },
          { 'brand.name': { $regex: keyword, $options: 'i' } },
          { 'universe.name': { $regex: keyword, $options: 'i' } },
          { 'condition.name': { $regex: keyword, $options: 'i' } },
        ); // ojo las palabras sueltas las busca en título, descripciones, tags, tipò de producto, marca universo y condicionm.
      });

      // Realizar la consulta
      const totalAdverts = await Advert.countDocuments(queryFilter);
      let adverts = await Advert.find(queryFilter)
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

      // Diferencia los anuncios que coinciden con la frase completa y aquellos que no
      adverts.forEach(advert => {
        if (advert.title.toLowerCase().includes(fullQuery.toLowerCase()) || advert.description.toLowerCase().includes(fullQuery.toLowerCase())) {
          advertsWithPriority.push(advert);
        } else {
          advertsWithoutPriority.push(advert);
        }
      });

      // Primero regresamos los anuncios de con la frase completa y luego las palabra ssueltas
      const advertsSorted = [...advertsWithPriority, ...advertsWithoutPriority];

      if (req.user) {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const favorites = user.favorites.map(id => id.toString());

        const advertsWithFavStatus = advertsSorted.map(advert => ({
          ...advert.toObject(),
          images: advert.images.map(image => cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })),
          isFavorite: favorites.includes(advert._id.toString()),
        }));

        return res.status(200).json({ adverts: advertsWithFavStatus, total: totalAdverts });
      }

      const advertsWithoutFavStatus = advertsSorted.map(advert => ({
        ...advert.toObject(),
        images: advert.images.map(image => cloudinary.url(image, { fetch_format: 'auto', quality: 'auto' })),
      }));

      // Logica original de SearchAdvert
      return res.status(200).json({ adverts: advertsWithoutFavStatus, total: totalAdverts });
    } else {
      // Si no hay parámetro 'searchTerm', se aplican los filtros estructurados como siempre
      if (title) queryFilter.title = { $regex: title, $options: 'i' };
      if (priceMin || priceMax) queryFilter.price = { $gte: Number(priceMin), $lte: Number(priceMax) };
      if (tags) queryFilter.tags = { $in: tags.split(',') };
      if (status) queryFilter.status = status;
      if (transaction) queryFilter.transaction = transaction;
      if (collectionref) queryFilter.collectionref = collectionref;
      if (brand) queryFilter.brand = brand;
      if (product_type) queryFilter.product_type = product_type;
      if (universe) queryFilter.universe = universe;
      if (condition) queryFilter.condition = condition;
      if (createdAtMin || createdAtMax) {
        queryFilter.createdAt = {};
        if (createdAtMin) queryFilter.createdAt.$gte = new Date(createdAtMin);
        if (createdAtMax) queryFilter.createdAt.$lte = new Date(createdAtMax);
      }
      if (slug) queryFilter.slug = { $regex: slug, $options: 'i' };
    }

    const totalAdverts = await Advert.countDocuments(queryFilter);

    const adverts = await Advert.find(queryFilter)
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


// Actualizar estado y visibilidad //////////////////////////////////////////////////////////////////////////////////////////////////////
export const updateAdvertStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const statusObj = await Status.findOne({ code: status });
    if (!statusObj) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const advert = await Advert.findById(id);
    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    advert.status = statusObj._id;

    advert.isVisible = (status === 'vendido') ? false : true;

    await advert.save();

    // Notificar a los usuarios que lo tenían en favoritos                 ////////////////////////////////////////
    await notifyStatusChange(advert._id, status);

    res.status(200).json({
      message: `Estado actualizado a ${status} y visibilidad ajustada.`,
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


// Editar un anuncio propio (Endpoint de Gestión de usuario)  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  let newImages = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [];

  try {
    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    const oldPrice = advert.price;

    if (advert.status === 'vendido') {
      return res.status(400).json({ message: 'No se puede editar un anuncio ya vendido.' });
    }

    if (advert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio.' });
    }

    const imagesToDelete = Array.isArray(advert.images) && Array.isArray(newImages)
      ? advert.images.filter(image => !newImages.includes(image))
      : [];

    if (imagesToDelete.length > 0) {
      for (const imageUrl of imagesToDelete) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          cloudinary.uploader.destroy(publicId, (err) => {
            if (err) {
              console.error(`Error al eliminar la imagen de Cloudinary: ${imageUrl}`, err);
            }
          });
        } else {
          console.warn(`No se pudo extraer public_id de la URL: ${imageUrl}`);
        }
      }
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
    advert.images = newImages.length > 0 ? newImages : advert.images;
    advert.updatedAt = Date.now();

    await advert.save();

    // Notificar a los usuarios que lo tenían en favoritos
    if (price && price !== oldPrice) {                                      //////////////////////////////////
      await notifyPriceChange(advert);                                      /////////////////////////////////////// 
    }                                                                       ///////////////////////////////////////

    res.status(200).json({
      message: 'Anuncio actualizado',
      advert,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al actualizar el anuncio', error: err.message });
  }
};



// Borrar anuncio propio (Endpoint de Gestión de usuario) ///////////////////////////////////////////////////////////////////////////////////////////////////////////
export const deleteAdvert = async (req, res, next) => {
  const { id } = req.params;

  try {
    const advert = await Advert.findById(id);
    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    // Notificar a los usuarios que lo tenían en favoritos
    await notifyAdvertDeleted(advert);

    if (advert.images && advert.images.length > 0) {
      for (const imageUrl of advert.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          cloudinary.uploader.destroy(publicId, (err) => {
            if (err) {
              console.error(`Error al eliminar imagen de Cloudinary: ${imageUrl}`, err);
            }
          });
        } else {
          console.warn(`No se pudo extraer public_id de la URL: ${imageUrl}`);
        }
      }
    }

    //  Eliminar el anuncio de los favoritos de los usuarios
    await User.updateMany(                        ////////////////////////////////////////////
      { favorites: id },                          /////////////////////////////////////////
      { $pull: { favorites: id } }                ///////////////////////////////////////
    );

    await Advert.findByIdAndDelete(id);

    res.status(200).json({ message: 'Anuncio eliminado' });
  } catch (err) {
    console.error(err);
    next(err);
    res.status(500).json({ message: 'Error al borrar el anuncio', error: err.message });
  }
};
