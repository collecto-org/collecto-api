import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import { logDetailedError } from '../utils/logger.js';

const storage = multer.memoryStorage();

const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

const uploadAdverts = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('images', 6);

// Subir el avatar
export const uploadAvatarToCloudinary = async (req, res, next) => {
  try {
    uploadAvatar(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error al subir el avatar', error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha proporcionado una imagen para el avatar' });
      }
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'avatars',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
      };

      const result = await uploadFromBuffer(req.file.buffer);

      req.body.avatarUrl = result.secure_url;

      next();
    });

  } catch (err) {
    logDetailedError(err, req, 'uploadAvatarToCloudinary');
    res.status(500).json({ message: 'Error al procesar la subida del avatar', error: err.message });
  }
};

// Subir las imagenes de adverts
export const uploadAdvertsToCloudinary = async (req, res, next) => {
  if (req.files && req.files.length > 6) {
    return res.status(400).json({ message: 'No puedes subir más de 6 imágenes' });
  }

  try {
    uploadAdverts(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error al subir las imágenes del anuncio', error: err.message });
      }

      const imageUrls = [];
      const folder = `adverts/${req.user.id}`;

      const uploadToCloudinaryStream = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: folder,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
      };

      for (const file of req.files) {
        const result = await uploadToCloudinaryStream(file.buffer);
        imageUrls.push(result.secure_url);
      }

      req.body.imageUrls = imageUrls;

      next();
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar la subida de las imágenes del anuncio', error: err.message });
  }
};

export const extractPublicId = (url) => {
  const matches = url.match(/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|webp)$/);
  return matches ? matches[1] : null;
};