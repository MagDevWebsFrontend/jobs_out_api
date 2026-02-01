// src/routes/uploads.routes.js
const express = require('express')
const path = require('path')
const fs = require('fs')
const upload = require('../middleware/upload.images')
const TrabajoService = require('../services/service.trabajo')
const { removeFileIfExists, removeDirIfEmpty } = require('../utils/file.utils')
const { authenticate } = require('../middleware/auth')
//const { dbContext } = require('../middleware/dbContext.middleware')

const router = express.Router()
router.use(authenticate);

/**
 * @swagger
 * /publicaciones/{trabajoId}/imagen:
 *   post:
 *     summary: Subir imagen para una publicación
 *     description: Sube una imagen asociada a una publicación específica. Solo el autor del trabajo o administrador pueden subir imágenes.
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trabajoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del trabajo al que se asociará la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagen
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (JPG, PNG, WEBP). Máx 5MB.
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Imagen subida'
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: 'imagen-1234567890.jpg'
 *                     size:
 *                       type: integer
 *                       example: 1024567
 *                     mimetype:
 *                       type: string
 *                       example: 'image/jpeg'
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: '/uploads/publicaciones/123e4567-e89b-12d3-a456-426614174000/imagen-1234567890.jpg'
 *       400:
 *         description: No se subió archivo o archivo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tienes permisos para subir imágenes a esta publicación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Trabajo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFoundError'
 *       413:
 *         description: Archivo demasiado grande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       415:
 *         description: Tipo de archivo no permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:trabajoId/imagen', upload.single('imagen'), async (req, res, next) => {
  try {
    const { trabajoId } = req.params

    // Validar que el trabajo existe y pertenece al usuario (trabajo.service ya tiene lógica)
    const trabajo = await TrabajoService.getTrabajoById(trabajoId, req.user || null)
    if (!trabajo) {
      // borrar archivo si subió por error
      if (req.file && req.file.path) removeFileIfExists(req.file.path)
      return res.status(404).json({ success: false, message: 'Trabajo no encontrado' })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió archivo' })
    }

    // Ruta pública accesible (coherente con app.js static)
    // ejemplo: /uploads/publicaciones/<trabajoId>/<filename>
    const publicUrl = path.posix.join('/uploads', 'publicaciones', trabajoId, req.file.filename)

    return res.json({
      success: true,
      message: 'Imagen subida',
      data: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: publicUrl
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /publicaciones/{trabajoId}/imagen/{filename}:
 *   delete:
 *     summary: Eliminar imagen de una publicación
 *     description: Elimina una imagen específica asociada a una publicación. Solo el autor del trabajo o administrador pueden eliminar imágenes.
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trabajoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del trabajo al que pertenece la imagen
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_\-\.]+$'
 *         description: Nombre del archivo de imagen a eliminar
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Archivo eliminado'
 *       401:
 *         description: No autorizado - Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tienes permisos para eliminar imágenes de esta publicación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Archivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:trabajoId/imagen/:filename', async (req, res, next) => {
  try {
    const { trabajoId, filename } = req.params
    const base = process.env.UPLOAD_PATH || path.join(process.cwd(), 'public', 'uploads', 'publicaciones')
    const filePath = path.join(base, trabajoId, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' })
    }

    removeFileIfExists(filePath)
    // intentar borrar la carpeta si quedó vacía
    removeDirIfEmpty(path.join(base, trabajoId))

    return res.json({ success: true, message: 'Archivo eliminado' })
  } catch (err) {
    next(err)
  }
})

module.exports = router