const { Op } = require('sequelize');
const { Guardado, Publicacion } = require('../models');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class GuardadoService {
  /**
   * Guardar una publicación
   */
  async guardarPublicacion(publicacionId, usuarioId) {
    try {
      logger.info(`Usuario ${usuarioId} guardando publicación ${publicacionId}`);
      
      // Verificar si la publicación existe
      const publicacion = await Publicacion.findByPk(publicacionId);
      if (!publicacion) {
        throw new AppError('Publicación no encontrada', 404);
      }

      // Verificar si ya está guardada
      const existe = await Guardado.findOne({
        where: {
          usuario_id: usuarioId,
          publicacion_id: publicacionId
        }
      });

      if (existe) {
        throw new AppError('Ya has guardado esta publicación', 409);
      }

      const guardado = await Guardado.create({
        usuario_id: usuarioId,
        publicacion_id: publicacionId
      });

      logger.info(`Publicación guardada exitosamente: ${publicacionId}`);
      return guardado;
    } catch (error) {
      logger.error(`Error guardando publicación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener publicaciones guardadas por usuario
   */
  async obtenerGuardadosPorUsuario(usuarioId, filtros = {}) {
    try {
      logger.info(`Obteniendo guardados del usuario: ${usuarioId}`);
      
      const where = { usuario_id: usuarioId };
      
      const guardados = await Guardado.findAll({
        where,
        include: [{
          model: Publicacion,
          as: 'publicacion', // Esto viene de tu index.js: Publicacion.belongsToMany...
          include: [
            {
              association: 'trabajo',
              include: [{
                association: 'municipio',
                include: ['provincia']
              }]
            },
            {
              association: 'autor',
              attributes: ['id', 'nombre', 'apellidos', 'username', 'avatar_url']
            }
          ]
        }],
        order: [['created_at', 'DESC']],
        limit: filtros.limit || 50,
        offset: filtros.offset || 0
      });

      // Contar total para paginación
      const total = await Guardado.count({ where });

      return {
        guardados,
        total,
        limit: filtros.limit || 50,
        offset: filtros.offset || 0
      };
    } catch (error) {
      logger.error(`Error obteniendo guardados: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar un guardado
   */
  async eliminarGuardado(publicacionId, usuarioId) {
    try {
      logger.info(`Eliminando guardado: ${publicacionId} por usuario: ${usuarioId}`);
      
      const guardado = await Guardado.findOne({
        where: {
          publicacion_id: publicacionId,
          usuario_id: usuarioId
        }
      });

      if (!guardado) {
        throw new AppError('Guardado no encontrado', 404);
      }

      await guardado.destroy();
      
      logger.info(`Guardado eliminado exitosamente: ${publicacionId}`);
      return { 
        mensaje: 'Publicación eliminada de guardados exitosamente',
        publicacion_id: publicacionId
      };
    } catch (error) {
      logger.error(`Error eliminando guardado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar si una publicación está guardada
   */
  async verificarSiEstaGuardada(publicacionId, usuarioId) {
    try {
      const guardado = await Guardado.findOne({
        where: {
          publicacion_id: publicacionId,
          usuario_id: usuarioId
        }
      });

      return {
        estaGuardada: !!guardado,
        fechaGuardado: guardado ? guardado.created_at : null
      };
    } catch (error) {
      logger.error(`Error verificando guardado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Contar guardados de una publicación
   */
  async contarGuardadosPorPublicacion(publicacionId) {
    try {
      const total = await Guardado.count({
        where: { publicacion_id: publicacionId }
      });

      return total;
    } catch (error) {
      logger.error(`Error contando guardados: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new GuardadoService();