const { Op } = require('sequelize');
const Publicacion = require('../models/Publicacion');
const Trabajo = require('../models/Trabajo');
const Usuario = require('../models/Usuario');
const Municipio = require('../models/Municipio');
const Provincia = require('../models/Provincia');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class PublicacionService {
  /**
   * Crear una nueva publicación
   */
  async crearPublicacion(data, userId) {
    try {
      logger.info(`Creando publicación para usuario: ${userId}`);
      
      // Verificar que el trabajo existe y pertenece al usuario
      const trabajo = await Trabajo.findOne({
        where: {
          id: data.trabajo_id,
          autor_id: userId
        }
      });

      if (!trabajo) {
        throw new AppError('Trabajo no encontrado o no autorizado', 404);
      }

      const publicacion = await Publicacion.create({
        trabajo_id: data.trabajo_id,
        autor_id: userId,
        estado: data.estado || 'publicado',
        imagen_url: data.imagen_url,
        publicado_en: new Date()
      });

      logger.info(`Publicación creada exitosamente: ${publicacion.id}`);
      return publicacion;
    } catch (error) {
      logger.error(`Error creando publicación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener todas las publicaciones (con filtros)
   */
  async obtenerPublicaciones(filtros = {}) {
    try {
      logger.info('Obteniendo publicaciones con filtros:', filtros);
      
      const where = {};
      const include = [
        {
          model: Trabajo,
          as: 'trabajo',
          include: [
            {
              model: Municipio,
              as: 'municipio',
              include: [{
                model: Provincia,
                as: 'provincia'
              }]
            }
          ]
        },
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellidos', 'username', 'avatar_url']
        }
      ];

      // Filtro por estado
      if (filtros.estado) {
        where.estado = filtros.estado;
      }

      // Filtro por municipio
      if (filtros.municipio_id) {
        include[0].where = { municipio_id: filtros.municipio_id };
      }

      // Filtro por provincia
      if (filtros.provincia_id) {
        include[0].include[0].where = { provincia_id: filtros.provincia_id };
      }

      // Filtro por modo de trabajo
      if (filtros.modo) {
        include[0].where = { ...include[0].where, modo: filtros.modo };
      }

      // Filtro por jornada
      if (filtros.jornada) {
        include[0].where = { ...include[0].where, jornada: filtros.jornada };
      }

      // Filtro por búsqueda en título
      if (filtros.busqueda) {
        include[0].where = {
          ...include[0].where,
          titulo: {
            [Op.iLike]: `%${filtros.busqueda}%`
          }
        };
      }

      const publicaciones = await Publicacion.findAll({
        where,
        include,
        order: [['publicado_en', 'DESC']],
        limit: filtros.limit || 50,
        offset: filtros.offset || 0
      });

      return publicaciones;
    } catch (error) {
      logger.error(`Error obteniendo publicaciones: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener una publicación por ID
   */
  async obtenerPublicacionPorId(id, userId = null) {
    try {
      logger.info(`Obteniendo publicación: ${id}`);
      
      const include = [
        {
          model: Trabajo,
          as: 'trabajo',
          include: [
            {
              model: Municipio,
              as: 'municipio',
              include: [{
                model: Provincia,
                as: 'provincia'
              }]
            }
          ]
        },
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombre', 'apellidos', 'username', 'avatar_url']
        }
      ];

      const publicacion = await Publicacion.findOne({
        where: { id },
        include
      });

      if (!publicacion) {
        throw new AppError('Publicación no encontrada', 404);
      }

      // Registrar visualización (solo para usuarios autenticados)
      if (userId) {
        logger.info(`Usuario ${userId} visualizó publicación ${id}`);
      }

      return publicacion;
    } catch (error) {
      logger.error(`Error obteniendo publicación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar una publicación
   */
  async actualizarPublicacion(id, data, userId) {
    try {
      logger.info(`Actualizando publicación: ${id} por usuario: ${userId}`);
      
      const publicacion = await Publicacion.findOne({
        where: { id, autor_id: userId }
      });

      if (!publicacion) {
        throw new AppError('Publicación no encontrada o no autorizada', 404);
      }

      // Solo permitir actualizar ciertos campos
      const camposPermitidos = ['estado', 'imagen_url'];
      const datosActualizar = {};
      
      camposPermitidos.forEach(campo => {
        if (data[campo] !== undefined) {
          datosActualizar[campo] = data[campo];
        }
      });

      // Si no hay nada que actualizar, retornar la publicación
      if (Object.keys(datosActualizar).length === 0) {
        return publicacion;
      }

      await publicacion.update(datosActualizar);
      
      logger.info(`Publicación actualizada exitosamente: ${id}`);
      return publicacion.reload();
    } catch (error) {
      logger.error(`Error actualizando publicación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar una publicación (soft delete)
   */
  async eliminarPublicacion(id, userId) {
    try {
      logger.info(`Eliminando publicación: ${id} por usuario: ${userId}`);
      
      const publicacion = await Publicacion.findOne({
        where: { id, autor_id: userId }
      });

      if (!publicacion) {
        throw new AppError('Publicación no encontrada o no autorizada', 404);
      }

      // Cambiar estado a archivado en lugar de eliminar
      await publicacion.update({ estado: 'archivado' });
      
      logger.info(`Publicación archivada exitosamente: ${id}`);
      return { mensaje: 'Publicación archivada exitosamente' };
    } catch (error) {
      logger.error(`Error eliminando publicación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener publicaciones por usuario
   */
  async obtenerPublicacionesPorUsuario(userId, filtros = {}) {
    try {
      logger.info(`Obteniendo publicaciones del usuario: ${userId}`);
      
      const where = { autor_id: userId };
      const include = [
        {
          model: Trabajo,
          as: 'trabajo',
          include: [
            {
              model: Municipio,
              as: 'municipio',
              include: [{
                model: Provincia,
                as: 'provincia'
              }]
            }
          ]
        }
      ];

      // Filtro por estado
      if (filtros.estado) {
        where.estado = filtros.estado;
      }

      const publicaciones = await Publicacion.findAll({
        where,
        include,
        order: [['publicado_en', 'DESC']]
      });

      return publicaciones;
    } catch (error) {
      logger.error(`Error obteniendo publicaciones por usuario: ${error.message}`);
      throw error;
    }
  }

  /**
   * Republicar un trabajo (crear nueva publicación de un trabajo existente)
   */
  async republicarTrabajo(trabajoId, userId, imagenUrl = null) {
    try {
      logger.info(`Republicando trabajo: ${trabajoId} por usuario: ${userId}`);
      
      // Verificar que el trabajo existe y pertenece al usuario
      const trabajo = await Trabajo.findOne({
        where: {
          id: trabajoId,
          autor_id: userId
        }
      });

      if (!trabajo) {
        throw new AppError('Trabajo no encontrado o no autorizado', 404);
      }

      // Crear nueva publicación
      const publicacion = await Publicacion.create({
        trabajo_id: trabajoId,
        autor_id: userId,
        estado: 'publicado',
        imagen_url: imagenUrl,
        publicado_en: new Date()
      });

      logger.info(`Trabajo republicado exitosamente: ${publicacion.id}`);
      return publicacion;
    } catch (error) {
      logger.error(`Error republicando trabajo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de publicaciones
   */
  async obtenerEstadisticas(usuarioId = null) {
    try {
      logger.info('Obteniendo estadísticas de publicaciones');
      
      const where = usuarioId ? { autor_id: usuarioId } : {};
      
      const total = await Publicacion.count({ where });
      const publicados = await Publicacion.count({ where: { ...where, estado: 'publicado' } });
      const borradores = await Publicacion.count({ where: { ...where, estado: 'borrador' } });
      const archivados = await Publicacion.count({ where: { ...where, estado: 'archivado' } });

      // Últimas 24 horas
      const ultimas24Horas = await Publicacion.count({
        where: {
          ...where,
          created_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      return {
        total,
        publicados,
        borradores,
        archivados,
        ultimas24Horas
      };
    } catch (error) {
      logger.error(`Error obteniendo estadísticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar si una publicación pertenece al usuario
   */
  async verificarPropiedad(id, userId) {
    try {
      const publicacion = await Publicacion.findOne({
        where: { id, autor_id: userId }
      });
      return !!publicacion;
    } catch (error) {
      logger.error(`Error verificando propiedad: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PublicacionService();