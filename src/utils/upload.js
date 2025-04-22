import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('images', 5);

export const uploadToCloudinary = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error al subir la imagen', error: err.message });
      }

      const imageUrls = [];
      const folder = req.body.type === 'avatar' ? 'avatars' : `adverts/${req.user.id}`;

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
    res.status(500).json({ message: 'Error al procesar la subida', error: err.message });
  }
};