const {
  serializePublicacion,
  serializePublicaciones
} = require('../utils/publicacion.serializer');

const publicacionService = require('../services/service.publicacion');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class PublicacionController {

  async crearPublicacion(req, res, next) {
    try {
      const { trabajo_id, estado, imagen_url } = req.body;
      const usuario_id = req.user.id;

      if (!trabajo_id) {
        throw new AppError('El ID del trabajo es requerido', 400);
      }

      const publicacion = await publicacionService.crearPublicacion(
        { trabajo_id, estado, imagen_url },
        usuario_id
      );

      logger.info(`Publicación creada: ${publicacion.id} por usuario: ${usuario_id}`);

      res.status(201).json({
        success: true,
        message: 'Publicación creada exitosamente',
        data: serializePublicacion(req, publicacion)
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPublicaciones(req, res, next) {
    try {
      const filtros = {
        ...req.query,
        limit: parseInt(req.query.limit || 50),
        offset: parseInt(req.query.offset || 0)
      };

      const publicaciones = await publicacionService.obtenerPublicaciones(filtros);

      res.json({
        success: true,
        data: serializePublicaciones(req, publicaciones),
        pagination: {
          total: publicaciones.length,
          limit: filtros.limit,
          offset: filtros.offset,
          hasMore: publicaciones.length === filtros.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPublicacionPorId(req, res, next) {
    try {
      const { id } = req.params;

      const publicacion = await publicacionService.obtenerPublicacionPorId(
        id,
        req.user?.id || null
      );

      res.json({
        success: true,
        data: serializePublicacion(req, publicacion)
      });
    } catch (error) {
      next(error);
    }
  }

  async actualizarPublicacion(req, res, next) {
    try {
      const { id } = req.params;

      const publicacion = await publicacionService.actualizarPublicacion(
        id,
        req.body,
        req.user.id
      );

      logger.info(`Publicación actualizada: ${id}`);

      res.json({
        success: true,
        message: 'Publicación actualizada exitosamente',
        data: serializePublicacion(req, publicacion)
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarPublicacion(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await publicacionService.eliminarPublicacion(
        id,
        req.user.id
      );

      res.json({
        success: true,
        message: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerMisPublicaciones(req, res, next) {
    try {
      const publicaciones = await publicacionService.obtenerPublicacionesPorUsuario(
        req.user.id,
        req.query
      );

      res.json({
        success: true,
        data: serializePublicaciones(req, publicaciones),
        total: publicaciones.length
      });
    } catch (error) {
      next(error);
    }
  }

  async republicarTrabajo(req, res, next) {
    try {
      const { trabajo_id, imagen_url } = req.body;

      const publicacion = await publicacionService.republicarTrabajo(
        trabajo_id,
        req.user.id,
        imagen_url
      );

      res.status(201).json({
        success: true,
        message: 'Trabajo republicado exitosamente',
        data: serializePublicacion(req, publicacion)
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerEstadisticas(req, res, next) {
    console.log('entro bien al controller')
    try {
      const estadisticas = await publicacionService.obtenerEstadisticas(
        req.user?.id || null
      );
      console.log(req.user.id)

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicacionController();
