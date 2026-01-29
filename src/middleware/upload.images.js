const multer = require('multer')
const path = require('path')
const fs = require('fs')

/**
 * Raíz real de uploads (coincide con express.static)
 * Express sirve: /uploads  →  src/public/uploads
 */
const UPLOAD_ROOT = process.env.UPLOAD_PATH
  || path.join(process.cwd(), 'src', 'public', 'uploads')

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) // 5MB
const ALLOWED = (process.env.ALLOWED_FILE_TYPES
  || 'image/jpeg,image/png,image/gif,image/webp'
).split(',')

/**
 * STORAGE
 * Guarda en:
 * src/public/uploads/publicaciones/<trabajoId>/
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const trabajoId = req.params.trabajoId

    if (!trabajoId) {
      return cb(new Error('trabajoId requerido en la ruta'), null)
    }

    const dir = path.join(
      UPLOAD_ROOT,
      'publicaciones',
      trabajoId
    )

    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${ext}`)
  }
})

/**
 * FILTRO DE ARCHIVOS
 */
const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('El archivo no es una imagen válida'), false)
  }

  // Segunda capa de seguridad (mimetype + extensión)
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '')
  if (!ALLOWED.includes(file.mimetype) && !ALLOWED.includes(`image/${ext}`)) {
    return cb(new Error('Tipo de imagen no permitido'), false)
  }

  cb(null, true)
}

/**
 * EXPORT
 */
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter
})

module.exports = upload
