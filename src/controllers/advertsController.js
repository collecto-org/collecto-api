import Advert from '../models/advert.js';
import Status from '../models/status.js';
import User from '../models/user.js';
//import { v2 as cloudinary } from 'cloudinary';
import cloudinary from '../config/cloudinaryConfig.js'
import { extractPublicId } from '../utils/upload.js';
import { notifyStatusChange, notifyPriceChange, notifyAdvertDeleted  } from './notificationController.js'; ////////////////////////////////////////////////////////////
import slugify from 'slugify';
import Brand from '../models/brand.js';
import ProductType from '../models/productType.js';
import Universe from "../models/universe.js"
import Condition from "../models/condition.js"
import Chat from '../models/chat.js';

// Obtener todos los anuncios
export const getAllAdverts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = -1 } = req.query;

    const allowedSortFields = ['price', 'createdAt', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;

    const availableStatuses = await Status.find({ code: { $in: ['available', 'reserved'] } });

    const availableStatusIds = availableStatuses.map(status => status._id);

    const adverts = await Advert.find({ status: { $in: availableStatusIds } })
    .sort({ [sortBy]: Number(sortOrder) })
    .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('transaction')
      .populate('status')
      .populate('product_type')
      .populate('universe')
      .populate('condition')
      .populate('brand')
      .populate('user', 'username avatarUrl -_id')

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
    .populate('user', 'username avatarUrl -_id') 

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

export const getAdvertById = async (req, res, next) => {
  const { id } = req.params;
  try {
console.log(id)
    const advert = await Advert.findById(id)
    .populate('transaction')
    .populate('status')
    .populate('product_type')
    .populate('universe')
    .populate('condition')
    .populate('brand')
    .populate('user', 'username avatarUrl -_id') 

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
      .populate('user', 'username avatarUrl -_id')

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

    if (!status) {
      const availableStatuses = await Status.find({ code: { $in: ['available', 'reserved'] } });
      const availableStatusIds = availableStatuses.map(s => s._id);
      queryFilter.status = { $in: availableStatusIds };
    }

    //INICIO DE LA LOGICA PARA BUSCAR EN EL BUSCADOR
    let advertsWithPriority = [];  // Anuncios con prioridad (frase exacta)
    let advertsWithoutPriority = [];  // Anuncios sin prioridad (palabras sueltas)
    if (searchTerm) {
      const keywords = searchTerm.trim().split(/\s+/);
      const fullQuery = searchTerm.trim();

      queryFilter.$or = [
        { title: { $regex: fullQuery, $options: 'i' } },
        { description: { $regex: fullQuery, $options: 'i' } },
      ];

      for (const keyword of keywords) {
        // Buscar IDs de documentos relacionados por nombre
        const [matchingBrands, matchingTypes, matchingUniverses, matchingConditions, matchingUsers] = await Promise.all([
          Brand.find({ name: { $regex: keyword, $options: 'i' } }).select('_id'),
          ProductType.find({ name: { $regex: keyword, $options: 'i' } }).select('_id'),
          Universe.find({ name: { $regex: keyword, $options: 'i' } }).select('_id'),
          Condition.find({ name: { $regex: keyword, $options: 'i' } }).select('_id'),
          User.find({ username: { $regex: keyword, $options: 'i' } }).select('_id'),

        ]);

        const brandIds = matchingBrands.map(b => b._id);
        const typeIds = matchingTypes.map(t => t._id);
        const universeIds = matchingUniverses.map(u => u._id);
        const conditionIds = matchingConditions.map(c => c._id);
        const userIds = matchingUsers.map(u => u._id);


        queryFilter.$or.push(
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [keyword] } },
          { brand: { $in: brandIds } },
          { product_type: { $in: typeIds } },
          { universe: { $in: universeIds } },
          { condition: { $in: conditionIds } },
          { user: { $in: userIds } }, 

        );
      }

      // Realizar la consulta
      const totalAdverts = await Advert.countDocuments(queryFilter);
      let adverts = await Advert.find(queryFilter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ [sortBy]: Number(sortOrder) })
        .populate('transaction')
        .populate('status')
        .populate('product_type')
        .populate('universe')
        .populate('condition')
        .populate('brand')
        .populate('user', 'username avatarUrl -_id')

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
      if (product_type) {
        const todosProductType = await ProductType.findOne({ slug: 'todos' });
        if (todosProductType && product_type === todosProductType._id.toString()) {
          queryFilter.product_type = { $ne: todosProductType._id };
        } else {
          queryFilter.product_type = product_type;
        }
      }      if (universe) queryFilter.universe = universe;
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
      .sort({ [sortBy]: Number(sortOrder) })
      .populate('transaction')
      .populate('status')
      .populate('product_type')
      .populate('universe')
      .populate('condition')
      .populate('brand')
      .populate('user', 'username avatarUrl -_id')

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
export const updateAdvertStatus = async (req, res, next, io, connectedUsers) => {
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
    await notifyStatusChange(advert, io, connectedUsers);

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

    newAdvert.slug = slugify(`${newAdvert.title}-${newAdvert._id}`, { lower: true, strict: true });
    await newAdvert.save();

    res.status(201).json({
      message: 'Anuncio creado',
      advert: newAdvert,
    });
  } catch (err) {
    next(err);
    res.status(500).json({ message: 'Error al crear el anuncio', error: err.message });
  }
};



// Editar un anuncio propio (Endpoint de Gestión de usuario)  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const editAdvert = async (req, res, next, io, connectedUsers) => {
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

  const bodyImages = req.body.imagesUrl;
  
  if (Array.isArray(bodyImages)) {
    bodyImages.forEach(image => {
      newImages.push(image);
    });
  } else if (typeof bodyImages === "string") {
    newImages.push(bodyImages);
  } else {
    console.log("El tipo de bodyImages no es válido");
  }
  

  try {
    const advert = await Advert.findById(id);

    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    const oldPrice = advert.price;
    const oldStatus = advert.status

    if (advert.status === 'vendido') {
      return res.status(400).json({ message: 'No se puede editar un anuncio ya vendido.' });
    }

    if (advert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este anuncio.' });
    }

    // Validar máximo 6 imágenes <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    if (newImages.length > 6) {
      return res.status(400).json({ message: 'No puedes subir más de 6 imágenes en un anuncio.' });
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
    const titleChanged = title && title !== advert.title;

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
    
    if (titleChanged) {
      advert.slug = slugify(`${advert.title}-${advert._id}`, { lower: true, strict: true });
    }
    
    await advert.save();
    

    // Notificar a los usuarios que lo tenían en favoritos
    if (price && Number(price) !== oldPrice) {                                      //////////////////////////////////
      await notifyPriceChange(advert, io, connectedUsers);                                      /////////////////////////////////////// 
    }                                                                       ///////////////////////////////////////
    if( advert.status.toString() !== oldStatus.toString()){
      await notifyStatusChange(advert, io, connectedUsers);
    }
    
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
export const deleteAdvert = async (req, res, next, io, connectedUsers) => {
  const { id } = req.params;

  try {
    const advert = await Advert.findById(id);
    if (!advert) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    // Notificar a los usuarios que lo tenían en favoritos
    await notifyAdvertDeleted(advert, io, connectedUsers);

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

    await Chat.deleteMany({ advertId: id });

    await Advert.findByIdAndDelete(id);

    res.status(200).json({ message: 'Anuncio eliminado' });
  } catch (err) {
    console.error(err);
    next(err);
    res.status(500).json({ message: 'Error al borrar el anuncio', error: err.message });
  }
};