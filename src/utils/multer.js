 // En src/utils/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = process.env.UPLOAD_PATH || './public/uploads';
    
    // Determinar subdirectorio basado en el tipo de archivo
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadPath, 'avatars');
    } else if (file.fieldname === 'cv') {
      uploadPath = path.join(uploadPath, 'cvs');
    } else if (file.fieldname === 'trabajo_imagen') {
      uploadPath = path.join(uploadPath, 'trabajos');
    } else {
      uploadPath = path.join(uploadPath, 'otros');
    }
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info(`📁 Directorio creado: ${uploadPath}`);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    
    // Guardar información del archivo en la request para uso posterior
    if (!req.uploadedFiles) req.uploadedFiles = {};
    req.uploadedFiles[file.fieldname] = {
      filename,
      originalname: file.originalname,
      path: `/uploads/${file.fieldname === 'avatar' ? 'avatars' : 
              file.fieldname === 'cv' ? 'cvs' : 
              file.fieldname === 'trabajo_imagen' ? 'trabajos' : 'otros'}/${filename}`,
      size: file.size,
      mimetype: file.mimetype
    };
    
    cb(null, filename);
  }
});

// Filtrar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo: ${allowedTypes.join(', ')}`), false);
  }
};

// Configurar límites
const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
  files: 5 // Máximo 5 archivos por solicitud
};

// Crear instancia de multer
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middlewares específicos
const uploadMiddleware = {
  // Subir avatar (una imagen)
  avatar: upload.single('avatar'),
  
  // Subir CV (un PDF)
  cv: upload.single('cv'),
  
  // Subir imagen de trabajo (una imagen)
  trabajoImagen: upload.single('trabajo_imagen'),
  
  // Subir múltiples imágenes para trabajo
  trabajoImagenes: upload.array('trabajo_imagenes', 3), // Máximo 3 imágenes
  
  // Subir archivos mixtos (para casos especiales)
  mixto: upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'trabajo_imagenes', maxCount: 3 }
  ]),
  
  // Any para desarrollo (acepta cualquier archivo)
  any: upload.any()
};

// Función para eliminar archivo
function deleteFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info(`🗑️  Archivo eliminado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error eliminando archivo:', error);
    return false;
  }
}

// Función para limpiar archivos temporales en caso de error
function cleanupFiles(req) {
  if (!req.uploadedFiles) return;
  
  Object.values(req.uploadedFiles).forEach(file => {
    if (file.path) {
      deleteFile(file.path);
    }
  });
}

module.exports = {
  upload,
  uploadMiddleware,
  deleteFile,
  cleanupFiles
};
