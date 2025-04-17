import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Destino de las imagenes
    const uploadPath = req.body.type === 'profile' 
      ? path.join(__dirname, '../public/pictures') // Para el avatar, se guarda en la carpeta 'pictures'
      : path.join(__dirname, '../public/images'); // Para los anuncios, se guarda en la carpeta 'images'
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nuevo nombre de la imagen
  },
});

const upload = multer({ storage: storage }).array('images', 5); // Limitar a un máximo de 5 imágenes

export default upload;
