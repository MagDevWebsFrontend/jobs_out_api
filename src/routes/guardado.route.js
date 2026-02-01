const express = require('express');
const router = express.Router();
const guardadoController = require('../controllers/guardado.controller');
const { authenticate } = require('../middleware/auth');
const { validateGuardado } = require('../middleware/validation.middleware');
const dbContext = require('../middleware/dbContext.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate,dbContext);

/**
 * @swagger
 * /guardados:
 *   post:
 *     summary: Guardar una publicación
 *     tags: [Guardados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicacion_id
 *             properties:
 *               publicacion_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Publicación guardada exitosamente
 *       409:
 *         description: La publicación ya está guardada
 */
router.post('/', 
  validateGuardado.create,
  guardadoController.guardarPublicacion
);

/**
 * @swagger
 * /guardados:
 *   get:
 *     summary: Obtener publicaciones guardadas del usuario
 *     tags: [Guardados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de publicaciones guardadas
 */
router.get('/', 
  validateGuardado.getAll,
  guardadoController.obtenerMisGuardados
);

/**
 * @swagger
 * /guardados/{id}:
 *   delete:
 *     summary: Eliminar una publicación de guardados
 *     tags: [Guardados]
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
 *     responses:
 *       200:
 *         description: Publicación eliminada de guardados
 */
router.delete('/:id', 
  validateGuardado.delete,
  guardadoController.eliminarGuardado
);

/**
 * @swagger
 * /guardados/{id}/verificar:
 *   get:
 *     summary: Verificar si una publicación está guardada
 *     tags: [Guardados]
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
 *     responses:
 *       200:
 *         description: Estado de guardado
 */
router.get('/:id/verificar',
  guardadoController.verificarSiEstaGuardada
);

module.exports = router;