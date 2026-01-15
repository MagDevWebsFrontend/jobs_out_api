const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacion.controller');
const { authenticate, authorize,optionalAuth } = require('../middleware/auth');
const { validatePublicacion } = require('../middleware/validation.middleware');

// Swagger tags
/**
 * @swagger
 * tags:
 *   name: Publicaciones
 *   description: Gestión de publicaciones de trabajos
 */


/**
 * @swagger
 * /publicaciones:
 *   get:
 *     summary: Obtener todas las publicaciones (pública)
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, publicado, archivado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: municipio_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por municipio
 *       - in: query
 *         name: provincia_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por provincia
 *       - in: query
 *         name: modo
 *         schema:
 *           type: string
 *           enum: [presencial, remoto, hibrido]
 *         description: Filtrar por modo de trabajo
 *       - in: query
 *         name: jornada
 *         schema:
 *           type: string
 *           enum: [tiempo_completo, tiempo_parcial, por_turnos]
 *         description: Filtrar por jornada
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Búsqueda por título
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 */
router.get('/', publicacionController.obtenerPublicaciones );


// Todas las rutas requieren autenticación excepto las de consulta pública
/*
Todas las rutas denajo de esto necesitaran autenticacion obligatoria */
//router.use(authenticate);

/**
 * @swagger
 * /publicaciones:
 *   post:
 *     summary: Crear una nueva publicación
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trabajo_id
 *             properties:
 *               trabajo_id:
 *                 type: string
 *                 format: uuid
 *               estado:
 *                 type: string
 *                 enum: [borrador, publicado, archivado]
 *                 default: publicado
 *               imagen_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', 
  validatePublicacion.create,
  publicacionController.crearPublicacion
);



/**
 * @swagger
 * /publicaciones/mis-publicaciones:
 *   get:
 *     summary: Obtener las publicaciones del usuario autenticado
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, publicado, archivado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Publicaciones del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/mis-publicaciones', 
  validatePublicacion.getMisPublicaciones,
  publicacionController.obtenerMisPublicaciones
);

/**
 * @swagger
 * /publicaciones/{id}:
 *   get:
 *     summary: Obtener una publicación por ID
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Publicación encontrada
 *       404:
 *         description: Publicación no encontrada
 */
router.get('/:id', 
  validatePublicacion.getById,
  publicacionController.obtenerPublicacionPorId
);

/**
 * @swagger
 * /publicaciones/{id}:
 *   put:
 *     summary: Actualizar una publicación
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la publicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [borrador, publicado, archivado]
 *               imagen_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Publicación actualizada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Publicación no encontrada
 */
router.put('/:id', 
  validatePublicacion.update,
  publicacionController.actualizarPublicacion
);

/**
 * @swagger
 * /publicaciones/{id}:
 *   delete:
 *     summary: Archivar una publicación
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Publicación archivada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Publicación no encontrada
 */
router.delete('/:id', 
  validatePublicacion.delete,
  publicacionController.eliminarPublicacion
);

/**
 * @swagger
 * /publicaciones/republicar:
 *   post:
 *     summary: Republicar un trabajo
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trabajo_id
 *             properties:
 *               trabajo_id:
 *                 type: string
 *                 format: uuid
 *               imagen_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trabajo republicado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/republicar', 
  validatePublicacion.republicar,
  publicacionController.republicarTrabajo
);

/**
 * @swagger
 * /publicaciones/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de publicaciones
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas
 *       401:
 *         description: No autorizado
 */
router.get('/estadisticas', 
  publicacionController.obtenerEstadisticas
);

module.exports = router;