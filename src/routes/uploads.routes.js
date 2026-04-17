const express = require('express')
const path = require('path')
const fs = require('fs')
const upload = require('../middleware/upload.images')
const TrabajoService = require('../services/service.trabajo')
const { removeFileIfExists, removeDirIfEmpty } = require('../utils/file.utils')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

// =========================
// 👤 SUBIR AVATAR
// =========================
router.post('/avatar', upload.single('imagen'), async (req, res, next) => {
  try {
    const userId = req.user.id

    console.log('📸 Avatar upload:', req.file)

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió archivo'
      })
    }

    const publicUrl = `/uploads/avatars/${userId}/${req.file.filename}`

    const { Usuario } = require('../models')
    const usuario = await Usuario.findByPk(userId)

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    await usuario.update({ avatar_url: publicUrl })

    return res.json({
      success: true,
      data: { url: publicUrl }
    })

  } catch (err) {
    next(err)
  }
})

// =========================
// 📸 SUBIR IMAGEN PUBLICACION
// =========================
router.post('/:trabajoId/imagen', upload.single('imagen'), async (req, res, next) => {
  try {
    const { trabajoId } = req.params

    console.log('📸 Publicacion upload:', req.file)

    const trabajo = await TrabajoService.getTrabajoById(trabajoId, req.user || null)

    if (!trabajo) {
      if (req.file?.path) removeFileIfExists(req.file.path)
      return res.status(404).json({ success: false, message: 'Trabajo no encontrado' })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió archivo' })
    }

    const publicUrl = `/uploads/publicaciones/${trabajoId}/${req.file.filename}`

    return res.json({
      success: true,
      data: { url: publicUrl }
    })

  } catch (err) {
    next(err)
  }
})

module.exports = router