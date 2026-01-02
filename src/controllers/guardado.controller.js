const guardadoService = require('../services/service.guardado');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class GuardadoController {
  /**
   * Guardar una publicación
   */
  async guardarPublicacion(req, res, next) {
    try {
      const { publicacion_id } = req.body;
      const usuarioId = req.user.id;

      if (!publicacion_id) {
        throw new AppError('El ID de la publicación es requerido', 400);
      }

      const guardado = await guardadoService.guardarPublicacion(publicacion_id, usuarioId);

      // Log de actividad
      logger.info(`Usuario ${usuarioId} guardó publicación ${publicacion_id}`);

      res.status(201).json({
        success: true,
        message: 'Publicación guardada exitosamente',
        data: guardado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener publicaciones guardadas del usuario
   */
  async obtenerMisGuardados(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      const resultado = await guardadoService.obtenerGuardadosPorUsuario(usuarioId, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        data: {
          guardados: resultado.guardados,
          pagination: {
            total: resultado.total,
            limit: resultado.limit,
            offset: resultado.offset,
            hasMore: (resultado.offset + resultado.guardados.length) < resultado.total
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un guardado
   */
  async eliminarGuardado(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;

      if (!id) {
        throw new AppError('El ID de la publicación es requerido', 400);
      }

      const resultado = await guardadoService.eliminarGuardado(id, usuarioId);

      // Log de actividad
      logger.info(`Usuario ${usuarioId} eliminó guardado ${id}`);

      res.status(200).json({
        success: true,
        message: resultado.mensaje,
        data: {
          publicacion_id: resultado.publicacion_id
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar si una publicación está guardada
   */
  async verificarSiEstaGuardada(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;

      if (!id) {
        throw new AppError('El ID de la publicación es requerido', 400);
      }

      const resultado = await guardadoService.verificarSiEstaGuardada(id, usuarioId);

      res.status(200).json({
        success: true,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de guardados
   */
  async obtenerEstadisticas(req, res, next) {
    try {
      const usuarioId = req.user?.id; // Opcional, admin puede ver todas
      
      const estadisticas = await guardadoService.obtenerEstadisticas(usuarioId);

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GuardadoController();