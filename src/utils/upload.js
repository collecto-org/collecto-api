import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar la carpeta según el tipo de archivo
    const uploadPath = req.body.type === 'profile' 
      ? path.join(__dirname, '../public/pictures') // Para el avatarde usuario, se guarda en la carpeta 'pictures'
      : path.join(__dirname, '../public/images'); // Para las fotos de los anuncios, se guarda en la carpeta 'images'
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para cada archivo
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Validar el tipo de archivo: Solo permitir imágenes (jpeg, jpg, png, gif)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
  }
};

// Configuración de multer con validación de archivos y límite de imágenes
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,  // Validar el tipo de archivo
}).array('images', 5);  // Limitar a un máximo de 5 imágenes

export default upload;
