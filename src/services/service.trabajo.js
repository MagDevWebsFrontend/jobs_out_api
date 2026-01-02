// En src/services/service.trabajo.js
const { Trabajo, Usuario, Municipio, Provincia, TrabajoContacto, sequelize  } = require('../models');
const AppError = require('../errors/AppError');
const {Op}  = require('sequelize');

class TrabajoService {
  /**
   * @description Obtener todos los trabajos con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Paginación
   * @param {Object} currentUser - Usuario actual (para permisos)
   * @returns {Promise<Object>} Lista de trabajos paginada
   */
  static async getAllTrabajos(filters = {}, pagination = {}, currentUser = null) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;
      
      const where = {};
      const include = [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombre', 'username', 'avatar_url'],
          paranoid: false
        },
        {
          model: Municipio,
          as: 'municipio',
          include: [{
            model: Provincia,
            as: 'provincia'
          }]
        },
        {
          model: TrabajoContacto,
          as: 'contactos',
          attributes: ['tipo', 'valor']
        }
      ];
      
      // Aplicar filtros básicos
      if (filters.estado) where.estado = filters.estado;
      if (filters.jornada) where.jornada = filters.jornada;
      if (filters.modo) where.modo = filters.modo;
      if (filters.municipio_id) where.municipio_id = filters.municipio_id;
      if (filters.provincia_id) {
        include[1].where = { provincia_id: filters.provincia_id };
      }
      
      // Si no es admin, solo mostrar trabajos publicados
      if (!currentUser || currentUser.rol !== 'admin') {
        where.estado = 'publicado';
        where.deleted_at = null;
      }
      
      // Búsqueda por texto en título o descripción
      if (filters.search) {
        where[Op.or] = [
          { titulo: { [Op.iLike]: `%${filters.search}%` } },
          { descripcion: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }
      
      // Filtro por experiencia mínima
      if (filters.experiencia_min !== undefined) {
        where.experiencia_min = { [Op.lte]: parseInt(filters.experiencia_min) };
      }
      
      // Ordenamiento
      const order = [];
      if (filters.sortBy) {
        const [field, direction] = filters.sortBy.split(':');
        order.push([field, direction || 'DESC']);
      } else {
        order.push(['created_at', 'DESC']);
      }
      
      const { count, rows } = await Trabajo.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        distinct: true,
        paranoid: currentUser?.rol === 'admin' // Incluir eliminados solo para admin
      });
      
      return {
        trabajos: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        },
        filters: filters
      };
    } catch (error) {
      console.error('Error en getAllTrabajos:', error);
      throw error;
    }
  }

  /**
   * @description Obtener trabajo por ID
   * @param {string} trabajoId - ID del trabajo
   * @param {Object} currentUser - Usuario actual (para permisos)
   * @returns {Promise<Object>} Trabajo con relaciones
   */
  static async getTrabajoById(trabajoId, currentUser = null) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId, {
        include: [
          {
            model: Usuario,
            as: 'autor',
            attributes: ['id', 'nombre', 'username', 'avatar_url', 'telefono_e164'],
            paranoid: false
          },
          {
            model: Municipio,
            as: 'municipio',
            include: [{
              model: Provincia,
              as: 'provincia'
            }]
          },
          {
            model: TrabajoContacto,
            as: 'contactos',
            attributes: ['tipo', 'valor']
          }
        ],
        paranoid: currentUser?.rol === 'admin'
      });
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos: solo admin o autor pueden ver borradores/archivados
      if (trabajo.estado !== 'publicado' && 
          (!currentUser || (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin'))) {
        throw AppError.forbidden('No tienes permiso para ver este trabajo');
      }
      
      return trabajo;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Crear nuevo trabajo
   * @param {Object} trabajoData - Datos del trabajo
   * @param {string} autorId - ID del usuario creador
   * @param {Array} contactos - Lista de contactos (opcional)
   * @returns {Promise<Object>} Trabajo creado
   */
  static async createTrabajo(trabajoData, autorId, contactos = []) {
    try {
      // Verificar que el usuario existe
      const autor = await Usuario.findByPk(autorId);
      if (!autor) {
        throw AppError.notFound('Usuario no encontrado');
      }
      
      // Crear el trabajo
      const trabajo = await Trabajo.create({
        ...trabajoData,
        autor_id: autorId,
        estado: trabajoData.estado || 'borrador'
      });
      
      // Crear contactos si se proporcionaron
      if (contactos && contactos.length > 0) {
        const contactosData = contactos.map(contacto => ({
          trabajo_id: trabajo.id,
          tipo: contacto.tipo,
          valor: contacto.valor
        }));
        
        await TrabajoContacto.bulkCreate(contactosData);
      }
      
      // Obtener el trabajo con relaciones
      const trabajoCompleto = await this.getTrabajoById(trabajo.id, { id: autorId, rol: autor.rol });
      
      return trabajoCompleto;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw AppError.validationError(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }

  /**
   * @description Actualizar trabajo
   * @param {string} trabajoId - ID del trabajo
   * @param {Object} updateData - Datos a actualizar
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<Object>} Trabajo actualizado
   */
  static async updateTrabajo(trabajoId, updateData, currentUser) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId);
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos: solo admin o autor pueden modificar
      if (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No tienes permiso para modificar este trabajo');
      }
      
      // Si cambia el estado a "publicado", verificar que tenga contactos
      if (updateData.estado === 'publicado' && trabajo.estado !== 'publicado') {
        const contactosCount = await TrabajoContacto.count({
          where: { trabajo_id: trabajoId }
        });
        
        if (contactosCount === 0) {
          throw AppError.badRequest('No se puede publicar un trabajo sin contactos');
        }
      }
      
      await trabajo.update(updateData);
      
      // Obtener el trabajo actualizado con relaciones
      const trabajoActualizado = await this.getTrabajoById(trabajoId, currentUser);
      
      return trabajoActualizado;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw AppError.validationError(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }

  /**
   * @description Eliminar trabajo (soft delete)
   * @param {string} trabajoId - ID del trabajo
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<boolean>} True si se eliminó
   */
  static async deleteTrabajo(trabajoId, currentUser) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId);
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos: solo admin o autor pueden eliminar
      if (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No tienes permiso para eliminar este trabajo');
      }
      
      await trabajo.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Publicar un trabajo (cambiar estado a publicado)
   * @param {string} trabajoId - ID del trabajo
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<Object>} Trabajo publicado
   */
  static async publicarTrabajo(trabajoId, currentUser) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId);
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos
      if (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No tienes permiso para publicar este trabajo');
      }
      
      // Verificar que tenga contactos
      const contactosCount = await TrabajoContacto.count({
        where: { trabajo_id: trabajoId }
      });
      
      if (contactosCount === 0) {
        throw AppError.badRequest('No se puede publicar un trabajo sin contactos');
      }
      
      // Cambiar estado a publicado
      await trabajo.update({ estado: 'publicado' });
      
      return await this.getTrabajoById(trabajoId, currentUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Archivar un trabajo (cambiar estado a archivado)
   * @param {string} trabajoId - ID del trabajo
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<Object>} Trabajo archivado
   */
  static async archivarTrabajo(trabajoId, currentUser) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId);
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos
      if (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No tienes permiso para archivar este trabajo');
      }
      
      // Cambiar estado a archivado
      await trabajo.update({ estado: 'archivado' });
      
      return await this.getTrabajoById(trabajoId, currentUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Obtener trabajos por usuario
   * @param {string} usuarioId - ID del usuario
   * @param {Object} currentUser - Usuario actual (para permisos)
   * @returns {Promise<Array>} Lista de trabajos del usuario
   */
  static async getTrabajosByUsuario(usuarioId, currentUser = null) {
    try {
      const where = { autor_id: usuarioId };
      
      // Si no es el dueño ni admin, solo mostrar publicados
      if (!currentUser || (currentUser.id !== usuarioId && currentUser.rol !== 'admin')) {
        where.estado = 'publicado';
        where.deleted_at = null;
      }
      
      const trabajos = await Trabajo.findAll({
        where,
        include: [
          {
            model: Municipio,
            as: 'municipio',
            include: [{ model: Provincia, as: 'provincia' }]
          },
          {
            model: TrabajoContacto,
            as: 'contactos',
            attributes: ['tipo', 'valor']
          }
        ],
        order: [['created_at', 'DESC']],
        paranoid: currentUser?.rol === 'admin'
      });
      
      return trabajos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Agregar contacto a un trabajo
   * @param {string} trabajoId - ID del trabajo
   * @param {Object} contactoData - Datos del contacto
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<Object>} Contacto creado
   */
  static async agregarContacto(trabajoId, contactoData, currentUser) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId);
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos
      if (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No tienes permiso para agregar contactos a este trabajo');
      }
      
      // Validar tipo de contacto
      const tiposPermitidos = ['telefono', 'whatsapp', 'email', 'sitio_web'];
      if (!tiposPermitidos.includes(contactoData.tipo)) {
        throw AppError.badRequest(`Tipo de contacto no válido. Tipos permitidos: ${tiposPermitidos.join(', ')}`);
      }
      
      // Validar formato según tipo
      if (contactoData.tipo === 'telefono' || contactoData.tipo === 'whatsapp') {
        const phoneRegex = /^\+\d{7,15}$/;
        if (!phoneRegex.test(contactoData.valor)) {
          throw AppError.badRequest('El teléfono debe estar en formato E.164 (ej: +584141234567)');
        }
      } else if (contactoData.tipo === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactoData.valor)) {
          throw AppError.badRequest('Debe ser un email válido');
        }
      }
      
      // Crear contacto
      const contacto = await TrabajoContacto.create({
        trabajo_id: trabajoId,
        tipo: contactoData.tipo,
        valor: contactoData.valor
      });
      
      return contacto;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw AppError.conflict('Este contacto ya existe para este trabajo');
      }
      throw error;
    }
  }

  /**
   * @description Eliminar contacto de un trabajo
   * @param {string} trabajoId - ID del trabajo
   * @param {string} tipo - Tipo de contacto
   * @param {string} valor - Valor del contacto
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<boolean>} True si se eliminó
   */
  static async eliminarContacto(trabajoId, tipo, valor, currentUser) {
    try {
      const trabajo = await Trabajo.findByPk(trabajoId);
      
      if (!trabajo) {
        throw AppError.notFound('Trabajo no encontrado');
      }
      
      // Verificar permisos
      if (currentUser.id !== trabajo.autor_id && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No tienes permiso para eliminar contactos de este trabajo');
      }
      
      const result = await TrabajoContacto.destroy({
        where: {
          trabajo_id: trabajoId,
          tipo: tipo,
          valor: valor
        }
      });
      
      if (result === 0) {
        throw AppError.notFound('Contacto no encontrado');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Obtener estadísticas de trabajos
   * @param {Object} currentUser - Usuario actual (admin only)
   * @returns {Promise<Object>} Estadísticas
   */
  static async getEstadisticas(currentUser) {
    try {
      if (currentUser.rol !== 'admin') {
        throw AppError.forbidden('Solo administradores pueden ver estadísticas');
      }
      
      // Conteo total por estado
      const porEstado = await Trabajo.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['estado'],
        raw: true
      });
      
      // Conteo por jornada
      const porJornada = await Trabajo.findAll({
        attributes: [
          'jornada',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['jornada'],
        raw: true
      });
      
      // Conteo por modo
      const porModo = await Trabajo.findAll({
        attributes: [
          'modo',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['modo'],
        raw: true
      });
      
      // Total trabajos
      const totalTrabajos = await Trabajo.count();
      
      // Trabajos publicados este mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      
      const trabajosEsteMes = await Trabajo.count({
        where: {
          estado: 'publicado',
          created_at: { [Op.gte]: inicioMes }
        }
      });
      
      return {
        total: totalTrabajos,
        por_estado: porEstado,
        por_jornada: porJornada,
        por_modo: porModo,
        trabajos_este_mes: trabajosEsteMes,
        fecha_consulta: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TrabajoService;