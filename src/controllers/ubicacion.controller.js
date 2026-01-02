// En src/controllers/ubicacion.controller.js
const UbicacionService = require('../services/service.ubicacion');

/**
 * @controller UbicacionController
 * @description Controlador para gestión de provincias y municipios
 */
class UbicacionController {
  /**
   * @route GET /api/provincias
   * @description Obtener todas las provincias
   * @access Public
   * @swagger
   * /provincias:
   *   get:
   *     summary: Obtener todas las provincias de Cuba
   *     tags: [Ubicaciones]
   *     responses:
   *       200:
   *         description: Lista de provincias
   */
  static async getAllProvincias(req, res, next) {
    try {
      const provincias = await UbicacionService.getAllProvincias();
      
      res.json({
        success: true,
        data: provincias
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/provincias/:id
   * @description Obtener provincia por ID con sus municipios
   * @access Public
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
   *         description: Provincia no encontrada
   */
  static async getProvinciaById(req, res, next) {
    try {
      const provincia = await UbicacionService.getProvinciaById(req.params.id);
      
      res.json({
        success: true,
        data: provincia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/municipios
   * @description Obtener todos los municipios
   * @access Public
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
  static async getAllMunicipios(req, res, next) {
    try {
      const filters = {};
      if (req.query.provincia_id) filters.provincia_id = req.query.provincia_id;
      
      const municipios = await UbicacionService.getAllMunicipios(filters);
      
      res.json({
        success: true,
        data: municipios
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/municipios/:id
   * @description Obtener municipio por ID
   * @access Public
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
   *         description: Municipio no encontrado
   */
  static async getMunicipioById(req, res, next) {
    try {
      const municipio = await UbicacionService.getMunicipioById(req.params.id);
      
      res.json({
        success: true,
        data: municipio
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/provincias
   * @description Crear nueva provincia (admin only)
   * @access Private (Admin)
   * @swagger
   * /provincias:
   *   post:
   *     summary: Crear nueva provincia
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
  static async createProvincia(req, res, next) {
    try {
      const provincia = await UbicacionService.createProvincia(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Provincia creada exitosamente',
        data: provincia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/municipios
   * @description Crear nuevo municipio (admin only)
   * @access Private (Admin)
   * @swagger
   * /municipios:
   *   post:
   *     summary: Crear nuevo municipio
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
  static async createMunicipio(req, res, next) {
    try {
      const municipio = await UbicacionService.createMunicipio(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Municipio creado exitosamente',
        data: municipio
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UbicacionController;