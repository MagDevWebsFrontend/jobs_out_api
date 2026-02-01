// src/routes/trabajo.route.js - CON DOCUMENTACIÓN SWAGGER
const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const TrabajoController = require('../controllers/trabajo.controller');
const dbContext = require('../middleware/dbContext.middleware');

/**
 * @swagger
 * /trabajos:
 *   get:
 *     summary: Obtener todos los trabajos con filtros avanzados
 *     description: |
 *       Obtiene una lista paginada de trabajos con múltiples filtros.
 *       - Público: Solo muestra trabajos con estado "publicado"
 *       - Autenticado: Puede ver sus propios trabajos en cualquier estado
 *       - Admin: Puede ver todos los trabajos en cualquier estado
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en título y descripción
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, publicado, archivado]
 *         description: Filtrar por estado del trabajo
 *       - in: query
 *         name: jornada
 *         schema:
 *           type: string
 *           enum: [completa, parcial, temporal, freelance, turnos]
 *         description: Tipo de jornada laboral
 *       - in: query
 *         name: modo
 *         schema:
 *           type: string
 *           enum: [presencial, remoto, hibrido]
 *         description: Modalidad de trabajo
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
 *         name: experiencia_min
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Experiencia mínima requerida en años
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: "created_at:DESC"
 *         description: Campo y dirección para ordenar (ej. salario_min:ASC)
 *     responses:
 *       200:
 *         description: Lista paginada de trabajos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrabajoListResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', optionalAuth, TrabajoController.getAllTrabajos);

/**
 * @swagger
 * /trabajos/mis-trabajos:
 *   get:
 *     summary: Obtener trabajos del usuario autenticado
 *     description: Obtiene todos los trabajos creados por el usuario actual (incluye borradores y archivados)
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trabajos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrabajoCompleto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/mis-trabajos', authenticate,dbContext, TrabajoController.getMisTrabajos);

/**
 * @swagger
 * /trabajos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de trabajos (solo admin)
 *     description: Obtiene estadísticas detalladas sobre los trabajos en la plataforma
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EstadisticasTrabajos'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/estadisticas', authenticate, authorize('admin'), TrabajoController.getEstadisticas);

/**
 * @swagger
 * /trabajos/{id}:
 *   get:
 *     summary: Obtener trabajo por ID
 *     description: |
 *       Obtiene un trabajo específico por su ID.
 *       - Público: Solo si el trabajo está publicado
 *       - Autenticado: Puede ver sus propios trabajos en cualquier estado
 *       - Admin: Puede ver cualquier trabajo en cualquier estado
 *     tags: [Trabajos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del trabajo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trabajo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TrabajoCompleto'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', optionalAuth, TrabajoController.getTrabajoById);

/**
 * @swagger
 * /trabajos:
 *   post:
 *     summary: Crear nuevo trabajo
 *     description: 'Crea una nueva oferta de trabajo. Estado por defecto: borrador.'
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descripcion
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Desarrollador Full Stack"
 *               descripcion:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 example: "Buscamos desarrollador con experiencia en Node.js y React"
 *               estado:
 *                 type: string
 *                 enum: [borrador, publicado, archivado]
 *                 default: borrador
 *               jornada:
 *                 type: string
 *                 enum: [completa, parcial, temporal, freelance, turnos]
 *                 example: completa
 *               modo:
 *                 type: string
 *                 enum: [presencial, remoto, hibrido]
 *                 example: remoto
 *               experiencia_min:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 2
 *               salario_min:
 *                 type: number
 *                 minimum: 0
 *                 example: 20000
 *               salario_max:
 *                 type: number
 *                 minimum: 0
 *                 example: 40000
 *               municipio_id:
 *                 type: string
 *                 format: uuid
 *               beneficios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Seguro médico", "Bonos por resultados"]
 *               contactos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [tipo, valor]
 *                   properties:
 *                     tipo:
 *                       type: string
 *                       enum: [telefono, whatsapp, email, sitio_web]
 *                     valor:
 *                       type: string
 *     responses:
 *       201:
 *         description: Trabajo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TrabajoCompleto'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authenticate, TrabajoController.createTrabajo);

/**
 * @swagger
 * /trabajos/{id}:
 *   put:
 *     summary: Actualizar trabajo existente
 *     description: Actualiza un trabajo existente (solo autor o admin)
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trabajo'
 *     responses:
 *       200:
 *         description: Trabajo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TrabajoCompleto'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authenticate,dbContext, TrabajoController.updateTrabajo);

/**
 * @swagger
 * /trabajos/{id}:
 *   delete:
 *     summary: Eliminar trabajo (soft delete)
 *     description: Elimina un trabajo (soft delete - solo autor o admin)
 *     tags: [Trabajos]
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
 *         description: Trabajo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', authenticate,dbContext, TrabajoController.deleteTrabajo);

/**
 * @swagger
 * /trabajos/{id}/publicar:
 *   post:
 *     summary: Publicar un trabajo
 *     description: Cambia el estado de un trabajo a "publicado" (requiere que tenga al menos un contacto)
 *     tags: [Trabajos]
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
 *         description: Trabajo publicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TrabajoCompleto'
 *       400:
 *         description: No se puede publicar un trabajo sin contactos
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/publicar', authenticate,dbContext, TrabajoController.publicarTrabajo);

/**
 * @swagger
 * /trabajos/{id}/archivar:
 *   post:
 *     summary: Archivar un trabajo
 *     description: Cambia el estado de un trabajo a "archivado"
 *     tags: [Trabajos]
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
 *         description: Trabajo archivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TrabajoCompleto'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/archivar', authenticate,dbContext, TrabajoController.archivarTrabajo);

/**
 * @swagger
 * /trabajos/{id}/contactos:
 *   post:
 *     summary: Agregar contacto a un trabajo
 *     description: Agrega un nuevo contacto a un trabajo existente
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, valor]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [telefono, whatsapp, email, sitio_web]
 *                 example: telefono
 *               valor:
 *                 type: string
 *                 example: "+584141234567"
 *     responses:
 *       201:
 *         description: Contacto agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TrabajoContacto'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: El contacto ya existe para este trabajo
 */
router.post('/:id/contactos', authenticate,dbContext, TrabajoController.agregarContacto);

/**
 * @swagger
 * /trabajos/{id}/contactos:
 *   delete:
 *     summary: Eliminar contacto de un trabajo
 *     description: Elimina un contacto específico de un trabajo
 *     tags: [Trabajos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, valor]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [telefono, whatsapp, email, sitio_web]
 *               valor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contacto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Se requiere tipo y valor del contacto
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Trabajo o contacto no encontrado
 */
router.delete('/:id/contactos', authenticate,dbContext, TrabajoController.eliminarContacto);




module.exports = router;