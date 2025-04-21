import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

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

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload_stream(
          { 
            resource_type: 'auto', 
            folder: folder,
          },
          (error, uploadResult) => {
            if (error) {
              return res.status(500).json({ message: 'Error al subir la imagen a Cloudinary', error: error.message });
            }
            imageUrls.push(uploadResult.secure_url);
          }
        );

        file.stream.pipe(result);
      }

      req.body.imageUrls = imageUrls;

      next();
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar la subida', error: err.message });
  }
};
