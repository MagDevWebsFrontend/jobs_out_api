// En src/services/service.ubicacion.js
const { Provincia, Municipio } = require('../models');
const AppError = require('../errors/AppError');

class UbicacionService {
  /**
   * @description Obtener todas las provincias
   * @returns {Promise<Array>} Lista de provincias
   */
  static async getAllProvincias() {
    try {
      const provincias = await Provincia.findAll({
        order: [['nombre', 'ASC']]
      });
      return provincias;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Obtener provincia por ID
   * @param {string} provinciaId - ID de la provincia
   * @returns {Promise<Object>} Provincia con municipios
   */
  static async getProvinciaById(provinciaId) {
    try {
      const provincia = await Provincia.findByPk(provinciaId, {
        include: [{
          association: 'municipios',
          order: [['nombre', 'ASC']]
        }]
      });

      if (!provincia) {
        throw AppError.notFound('Provincia no encontrada');
      }

      return provincia;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Obtener todos los municipios
   * @param {Object} filters - Filtros
   * @returns {Promise<Array>} Lista de municipios
   */
  static async getAllMunicipios(filters = {}) {
    try {
      const where = {};
      if (filters.provincia_id) where.provincia_id = filters.provincia_id;

      const municipios = await Municipio.findAll({
        where,
        include: [{
          association: 'provincia',
          attributes: ['id', 'nombre']
        }],
        order: [['nombre', 'ASC']]
      });

      return municipios;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Obtener municipio por ID
   * @param {string} municipioId - ID del municipio
   * @returns {Promise<Object>} Municipio con provincia
   */
  static async getMunicipioById(municipioId) {
    try {
      const municipio = await Municipio.findByPk(municipioId, {
        include: [{
          association: 'provincia',
          attributes: ['id', 'nombre']
        }]
      });

      if (!municipio) {
        throw AppError.notFound('Municipio no encontrado');
      }

      return municipio;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Crear nueva provincia (admin only)
   * @param {Object} provinciaData - Datos de la provincia
   * @returns {Promise<Object>} Provincia creada
   */
  static async createProvincia(provinciaData) {
    try {
      // Verificar si ya existe
      const existing = await Provincia.findOne({
        where: { nombre: provinciaData.nombre }
      });

      if (existing) {
        throw AppError.conflict('Ya existe una provincia con este nombre');
      }

      const provincia = await Provincia.create(provinciaData);
      return provincia;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw AppError.validationError(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }

  /**
   * @description Crear nuevo municipio (admin only)
   * @param {Object} municipioData - Datos del municipio
   * @returns {Promise<Object>} Municipio creado
   */
  static async createMunicipio(municipioData) {
    try {
      // Verificar si la provincia existe
      const provincia = await Provincia.findByPk(municipioData.provincia_id);
      if (!provincia) {
        throw AppError.notFound('Provincia no encontrada');
      }

      // Verificar si ya existe en esa provincia
      const existing = await Municipio.findOne({
        where: {
          provincia_id: municipioData.provincia_id,
          nombre: municipioData.nombre
        }
      });

      if (existing) {
        throw AppError.conflict('Ya existe un municipio con este nombre en esta provincia');
      }

      const municipio = await Municipio.create(municipioData);
      
      // Incluir provincia en la respuesta
      const municipioConProvincia = await Municipio.findByPk(municipio.id, {
        include: [{
          association: 'provincia',
          attributes: ['id', 'nombre']
        }]
      });

      return municipioConProvincia;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw AppError.validationError(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }
}

module.exports = UbicacionService;