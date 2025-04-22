import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

const storage = multer.memoryStorage();  // Usamos la memoria del servidor para los archivos

// Configuración de multer para subir imágenes (avatar o anuncios)
const uploadImages = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Límite de tamaño de archivo (10MB)
}).array('images', 6);  // Permite subir hasta 6 imágenes

// Middleware para subir avatar o imágenes de anuncios
export const uploadImagesToCloudinary = async (req, res, next) => {
  try {
    uploadImages(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error al subir las imágenes', error: err.message });
      }

      const imageUrls = [];  // Para almacenar las URLs de las imágenes subidas

      let folder = 'avatars';  // Por defecto, la carpeta será 'avatars' (para el avatar del usuario)

      // Si el avatar es subido, asignamos la URL del avatar y lo subimos a la carpeta 'avatars'
      if (req.files.length === 1 && req.body.isAvatar) {
        folder = 'avatars';  // Aseguramos que siempre se sube a 'avatars'
      } else if (req.files.length > 0) {
        folder = `adverts/${req.user.id}`;  // Si es un anuncio, lo subimos a una carpeta única del usuario dentro de 'adverts'
      }

      // Función para subir imágenes a Cloudinary
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

      // Subimos las imágenes a Cloudinary
      for (const file of req.files) {
        const result = await uploadToCloudinaryStream(file.buffer);
        imageUrls.push(result.secure_url);
      }

      // Si es un avatar, guardamos solo la primera imagen en 'avatarUrl'
      if (req.body.isAvatar) {
        req.body.avatarUrl = imageUrls[0];  // Solo usamos la primera imagen como avatar
      } else {
        req.body.imageUrls = imageUrls;  // Si son imágenes del anuncio, las almacenamos todas en 'imageUrls'
      }

      next();  // Continuamos con la siguiente etapa
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar la subida de imágenes', error: err.message });
  }
};