const multer = require('multer')
const path = require('path')
const fs = require('fs')

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10)

const ALLOWED = (
  process.env.ALLOWED_FILE_TYPES ||
  'image/jpeg,image/png,image/gif,image/webp'
).split(',')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      let dir = ''

      // 📸 PUBLICACIONES
      if (req.params.trabajoId) {
        dir = path.join(UPLOAD_ROOT, 'publicaciones', req.params.trabajoId)
      }

      // 👤 AVATAR
      else if (req.originalUrl.includes('/avatar')) {
        if (!req.user?.id) {
          return cb(new Error('Usuario no autenticado'), null)
        }

        dir = path.join(UPLOAD_ROOT, 'avatars', req.user.id)
      }

      else {
        return cb(new Error('Ruta de upload no válida'), null)
      }

      // crear carpeta SIEMPRE
      fs.mkdirSync(dir, { recursive: true })

      console.log('📁 Upload dir:', dir)

      cb(null, dir)

    } catch (err) {
      cb(err, null)
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    cb(null, `${unique}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Archivo no es imagen'), false)
  }

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '')

  if (!ALLOWED.includes(file.mimetype) && !ALLOWED.includes(`image/${ext}`)) {
    return cb(new Error('Tipo de imagen no permitido'), false)
  }

  cb(null, true)
}

module.exports = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter
})