const trabajoContactoService = require('../services/service.trabajoContacto');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class TrabajoContactoController {
  /**
   * Agregar contacto a un trabajo
   */
  async agregarContacto(req, res, next) {
    try {
      const { trabajo_id } = req.params;
      const contacto = req.body;
      const usuarioId = req.user.id;

      if (!trabajo_id) {
        throw new AppError('ID del trabajo es requerido', 400);
      }

      if (!contacto.tipo || !contacto.valor) {
        throw new AppError('Tipo y valor del contacto son requeridos', 400);
      }

      const nuevoContacto = await trabajoContactoService.agregarContacto(
        trabajo_id, 
        contacto, 
        usuarioId
      );

      logger.info(`Usuario ${usuarioId} agregó contacto al trabajo ${trabajo_id}`);

      res.status(201).json({
        success: true,
        message: 'Contacto agregado exitosamente',
        data: nuevoContacto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener contactos de un trabajo
   */
  async obtenerContactosPorTrabajo(req, res, next) {
    try {
      const { trabajo_id } = req.params;
      const usuarioId = req.user?.id; // Opcional

      if (!trabajo_id) {
        throw new AppError('ID del trabajo es requerido', 400);
      }

      const contactos = await trabajoContactoService.obtenerContactosPorTrabajo(
        trabajo_id, 
        usuarioId
      );

      res.status(200).json({
        success: true,
        data: contactos,
        total: contactos.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar contacto de un trabajo
   */
  async actualizarContacto(req, res, next) {
    try {
      const { trabajo_id, tipo, valor } = req.params;
      const { nuevo_valor } = req.body;
      const usuarioId = req.user.id;

      if (!trabajo_id || !tipo || !valor) {
        throw new AppError('Trabajo ID, tipo y valor son requeridos', 400);
      }

      if (!nuevo_valor) {
        throw new AppError('Nuevo valor es requerido', 400);
      }

      const contactoActualizado = await trabajoContactoService.actualizarContacto(
        trabajo_id, 
        tipo, 
        valor, 
        nuevo_valor, 
        usuarioId
      );

      logger.info(`Usuario ${usuarioId} actualizó contacto del trabajo ${trabajo_id}`);

      res.status(200).json({
        success: true,
        message: 'Contacto actualizado exitosamente',
        data: contactoActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar contacto de un trabajo
   */
  async eliminarContacto(req, res, next) {
    try {
      const { trabajo_id, tipo, valor } = req.params;
      const usuarioId = req.user.id;

      if (!trabajo_id || !tipo || !valor) {
        throw new AppError('Trabajo ID, tipo y valor son requeridos', 400);
      }

      const resultado = await trabajoContactoService.eliminarContacto(
        trabajo_id, 
        tipo, 
        valor, 
        usuarioId
      );

      logger.info(`Usuario ${usuarioId} eliminó contacto del trabajo ${trabajo_id}`);

      res.status(200).json({
        success: true,
        message: resultado.mensaje,
        data: {
          trabajo_id: resultado.trabajo_id,
          tipo: resultado.tipo,
          valor: resultado.valor
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de contactos
   */
  async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await trabajoContactoService.obtenerEstadisticas();

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrabajoContactoController();