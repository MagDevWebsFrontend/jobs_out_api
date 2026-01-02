// En src/routes/ubicacion.route.js (simplificar para que funcione)
const express = require('express');
const router = express.Router();
const UbicacionController = require('../controllers/ubicacion.controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /provincias:
 *   get:
 *     summary: Obtener todas las provincias de Cuba
 *     tags: [Ubicaciones]
 *     responses:
 *       200:
 *         description: Lista de provincias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/provincias', UbicacionController.getAllProvincias);

/**
 * @swagger
 * /provincias/{id}:
 *   get:
 *     summary: Obtener provincia por ID
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Provincia con municipios
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/provincias/:id', UbicacionController.getProvinciaById);

/**
 * @swagger
 * /provincias:
 *   post:
 *     summary: Crear nueva provincia (admin only)
 *     tags: [Ubicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nueva Provincia"
 *     responses:
 *       201:
 *         description: Provincia creada
 *       409:
 *         description: Ya existe una provincia con este nombre
 */
router.post('/provincias', authenticate, authorize('admin'), UbicacionController.createProvincia);

/**
 * @swagger
 * /municipios:
 *   get:
 *     summary: Obtener todos los municipios
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: query
 *         name: provincia_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de municipios
 */
router.get('/municipios', UbicacionController.getAllMunicipios);

/**
 * @swagger
 * /municipios/{id}:
 *   get:
 *     summary: Obtener municipio por ID
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Municipio encontrado
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/municipios/:id', UbicacionController.getMunicipioById);

/**
 * @swagger
 * /municipios:
 *   post:
 *     summary: Crear nuevo municipio (admin only)
 *     tags: [Ubicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provincia_id
 *               - nombre
 *             properties:
 *               provincia_id:
 *                 type: string
 *                 format: uuid
 *               nombre:
 *                 type: string
 *                 example: "Nuevo Municipio"
 *     responses:
 *       201:
 *         description: Municipio creado
 *       404:
 *         description: Provincia no encontrada
 *       409:
 *         description: Ya existe un municipio con este nombre en esta provincia
 */
router.post('/municipios', authenticate, authorize('admin'), UbicacionController.createMunicipio);

module.exports = router;