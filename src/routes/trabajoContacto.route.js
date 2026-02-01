const express = require('express');
const router = express.Router();
const trabajoContactoController = require('../controllers/trabajoContacto.controller');
const { authenticate } = require('../middleware/auth');
const { validateContacto } = require('../middleware/validation.middleware');
const dbContext = require('../middleware/dbContext.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate,dbContext);

// Swagger tags
/**
 * @swagger
 * tags:
 *   name: TrabajoContactos
 *   description: Gestión de contactos de trabajos
 */

/**
 * @swagger
 * /trabajos/{trabajo_id}/contactos:
 *   post:
 *     summary: Agregar contacto a un trabajo
 *     tags: [TrabajoContactos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trabajo_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del trabajo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - valor
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [telefono, whatsapp, email, sitio_web]
 *               valor:
 *                 type: string
 *                 example: "+584141234567"
 *     responses:
 *       201:
 *         description: Contacto agregado exitosamente
 */
router.post('/:trabajo_id/contactos', 
  validateContacto,
  trabajoContactoController.agregarContacto
);

/**
 * @swagger
 * /trabajos/{trabajo_id}/contactos:
 *   get:
 *     summary: Obtener contactos de un trabajo
 *     tags: [TrabajoContactos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trabajo_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de contactos del trabajo
 */
router.get('/:trabajo_id/contactos', 
  trabajoContactoController.obtenerContactosPorTrabajo
);

/**
 * @swagger
 * /trabajos/{trabajo_id}/contactos/{tipo}/{valor}:
 *   put:
 *     summary: Actualizar contacto de un trabajo
 *     tags: [TrabajoContactos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trabajo_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [telefono, whatsapp, email, sitio_web]
 *       - in: path
 *         name: valor
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevo_valor
 *             properties:
 *               nuevo_valor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 */
router.put('/:trabajo_id/contactos/:tipo/:valor', 
  trabajoContactoController.actualizarContacto
);

/**
 * @swagger
 * /trabajos/{trabajo_id}/contactos/{tipo}/{valor}:
 *   delete:
 *     summary: Eliminar contacto de un trabajo
 *     tags: [TrabajoContactos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trabajo_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [telefono, whatsapp, email, sitio_web]
 *       - in: path
 *         name: valor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contacto eliminado exitosamente
 */
router.delete('/:trabajo_id/contactos/:tipo/:valor', 
  trabajoContactoController.eliminarContacto
);

/**
 * @swagger
 * /contactos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de contactos
 *     tags: [TrabajoContactos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de contactos
 */
router.get('/contactos/estadisticas', 
  trabajoContactoController.obtenerEstadisticas
);

module.exports = router;