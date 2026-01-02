const publicacionService = require('../services/service.publicacion');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class PublicacionController {
  /**
   * Crear una nueva publicación
   */
  async crearPublicacion(req, res, next) {
    try {
      const { trabajo_id, estado, imagen_url } = req.body;
      const usuario_id = req.user.id; // Del middleware de autenticación

      // Validación básica
      if (!trabajo_id) {
        throw new AppError('El ID del trabajo es requerido', 400);
      }

      const publicacion = await publicacionService.crearPublicacion(
        { trabajo_id, estado, imagen_url },
        usuario_id
      );

      // Registrar en logs
      logger.info(`Publicación creada: ${publicacion.id} por usuario: ${usuario_id}`);

      res.status(201).json({
        success: true,
        message: 'Publicación creada exitosamente',
        data: publicacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todas las publicaciones (con filtros)
   */
  async obtenerPublicaciones(req, res, next) {
    try {
      const {
        estado,
        municipio_id,
        provincia_id,
        modo,
        jornada,
        busqueda,
        limit = 50,
        offset = 0
      } = req.query;

      const filtros = {
        estado,
        municipio_id,
        provincia_id,
        modo,
        jornada,
        busqueda,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Limpiar filtros undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined) {
          delete filtros[key];
        }
      });

      const publicaciones = await publicacionService.obtenerPublicaciones(filtros);

      // Contar total para paginación
      const total = publicaciones.length;

      res.status(200).json({
        success: true,
        data: publicaciones,
        pagination: {
          total,
          limit: filtros.limit || 50,
          offset: filtros.offset || 0,
          hasMore: total === (filtros.limit || 50)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener una publicación por ID
   */
  async obtenerPublicacionPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario_id = req.user?.id; // Opcional, para usuarios autenticados

      if (!id) {
        throw new AppError('ID de publicación es requerido', 400);
      }

      const publicacion = await publicacionService.obtenerPublicacionPorId(id, usuario_id);

      res.status(200).json({
        success: true,
        data: publicacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar una publicación
   */
  async actualizarPublicacion(req, res, next) {
    try {
      const { id } = req.params;
      const datos = req.body;
      const usuario_id = req.user.id;

      if (!id) {
        throw new AppError('ID de publicación es requerido', 400);
      }

      const publicacion = await publicacionService.actualizarPublicacion(
        id,
        datos,
        usuario_id
      );

      // Registrar en logs
      logger.info(`Publicación actualizada: ${id} por usuario: ${usuario_id}`);

      res.status(200).json({
        success: true,
        message: 'Publicación actualizada exitosamente',
        data: publicacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar/archivar una publicación
   */
  async eliminarPublicacion(req, res, next) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      if (!id) {
        throw new AppError('ID de publicación es requerido', 400);
      }

      const resultado = await publicacionService.eliminarPublicacion(id, usuario_id);

      // Registrar en logs
      logger.info(`Publicación archivada: ${id} por usuario: ${usuario_id}`);

      res.status(200).json({
        success: true,
        message: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener publicaciones del usuario autenticado
   */
  async obtenerMisPublicaciones(req, res, next) {
    try {
      const { estado } = req.query;
      const usuario_id = req.user.id;

      const filtros = {};
      if (estado) filtros.estado = estado;

      const publicaciones = await publicacionService.obtenerPublicacionesPorUsuario(
        usuario_id,
        filtros
      );

      res.status(200).json({
        success: true,
        data: publicaciones,
        total: publicaciones.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Republicar un trabajo
   */
  async republicarTrabajo(req, res, next) {
    try {
      const { trabajo_id } = req.body;
      const { imagen_url } = req.body;
      const usuario_id = req.user.id;

      if (!trabajo_id) {
        throw new AppError('ID del trabajo es requerido', 400);
      }

      const publicacion = await publicacionService.republicarTrabajo(
        trabajo_id,
        usuario_id,
        imagen_url
      );

      // Registrar en logs
      logger.info(`Trabajo republicado: ${trabajo_id} por usuario: ${usuario_id}`);

      res.status(201).json({
        success: true,
        message: 'Trabajo republicado exitosamente',
        data: publicacion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de publicaciones
   */
  async obtenerEstadisticas(req, res, next) {
    try {
      const usuario_id = req.user?.id; // Opcional, admin puede ver todas
      
      const estadisticas = await publicacionService.obtenerEstadisticas(usuario_id);

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicacionController();