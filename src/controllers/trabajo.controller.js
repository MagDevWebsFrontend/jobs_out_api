// En src/controllers/trabajo.controller.js
const TrabajoService = require('../services/service.trabajo');

/**
 * @controller TrabajoController
 * @description Controlador para gestión de trabajos
 */
class TrabajoController {
  /**
   * @route GET /api/trabajos
   * @description Obtener todos los trabajos con filtros
   * @access Public/Private (depende del estado)
   */
  static async getAllTrabajos(req, res, next) {
    try {
      const { page, limit, search, estado, jornada, modo, municipio_id, provincia_id, experiencia_min, sortBy } = req.query;
      
      const filters = {
        search,
        estado,
        jornada,
        modo,
        municipio_id,
        provincia_id,
        experiencia_min,
        sortBy
      };
      
      // Remover undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });
      
      const result = await TrabajoService.getAllTrabajos(
        filters, 
        { page, limit }, 
        req.user || null
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/trabajos/:id
   * @description Obtener trabajo por ID
   * @access Public/Private (depende del estado y permisos)
   */
  static async getTrabajoById(req, res, next) {
    try {
      const trabajo = await TrabajoService.getTrabajoById(req.params.id, req.user || null);
      
      res.json({
        success: true,
        data: trabajo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/trabajos
   * @description Crear nuevo trabajo
   * @access Private (cualquier usuario autenticado)
   */
  static async createTrabajo(req, res, next) {
    try {
      const { contactos, ...trabajoData } = req.body;
      
      const trabajo = await TrabajoService.createTrabajo(
        trabajoData, 
        req.user.id, 
        contactos
      );
      
      res.status(201).json({
        success: true,
        message: 'Trabajo creado exitosamente',
        data: trabajo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/trabajos/:id
   * @description Actualizar trabajo
   * @access Private (autor o admin)
   */
  static async updateTrabajo(req, res, next) {
    try {
      const trabajo = await TrabajoService.updateTrabajo(
        req.params.id, 
        req.body, 
        req.user
      );
      
      res.json({
        success: true,
        message: 'Trabajo actualizado exitosamente',
        data: trabajo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/trabajos/:id
   * @description Eliminar trabajo (soft delete)
   * @access Private (autor o admin)
   */
  static async deleteTrabajo(req, res, next) {
    try {
      await TrabajoService.deleteTrabajo(req.params.id, req.user);
      
      res.json({
        success: true,
        message: 'Trabajo eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/trabajos/:id/publicar
   * @description Publicar un trabajo (cambiar estado a publicado)
   * @access Private (autor o admin)
   */
  static async publicarTrabajo(req, res, next) {
    try {
      const trabajo = await TrabajoService.publicarTrabajo(req.params.id, req.user);
      
      res.json({
        success: true,
        message: 'Trabajo publicado exitosamente',
        data: trabajo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/trabajos/:id/archivar
   * @description Archivar un trabajo (cambiar estado a archivado)
   * @access Private (autor o admin)
   */
  static async archivarTrabajo(req, res, next) {
    try {
      const trabajo = await TrabajoService.archivarTrabajo(req.params.id, req.user);
      
      res.json({
        success: true,
        message: 'Trabajo archivado exitosamente',
        data: trabajo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/usuarios/:usuarioId/trabajos
   * @description Obtener trabajos por usuario
   * @access Public/Private (depende de permisos)
   */
  static async getTrabajosByUsuario(req, res, next) {
    try {
      const trabajos = await TrabajoService.getTrabajosByUsuario(
        req.params.usuarioId, 
        req.user || null
      );
      
      res.json({
        success: true,
        data: trabajos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/trabajos/:id/contactos
   * @description Agregar contacto a un trabajo
   * @access Private (autor o admin)
   */
  static async agregarContacto(req, res, next) {
    try {
      const contacto = await TrabajoService.agregarContacto(
        req.params.id, 
        req.body, 
        req.user
      );
      
      res.status(201).json({
        success: true,
        message: 'Contacto agregado exitosamente',
        data: contacto
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/trabajos/:id/contactos
   * @description Eliminar contacto de un trabajo
   * @access Private (autor o admin)
   */
  static async eliminarContacto(req, res, next) {
    try {
      const { tipo, valor } = req.body;
      
      if (!tipo || !valor) {
        throw AppError.badRequest('Se requiere tipo y valor del contacto');
      }
      
      await TrabajoService.eliminarContacto(
        req.params.id, 
        tipo, 
        valor, 
        req.user
      );
      
      res.json({
        success: true,
        message: 'Contacto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/trabajos/estadisticas
   * @description Obtener estadísticas de trabajos (admin only)
   * @access Private (admin only)
   */
  static async getEstadisticas(req, res, next) {
    try {
      const estadisticas = await TrabajoService.getEstadisticas(req.user);
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/trabajos/mis-trabajos
   * @description Obtener trabajos del usuario actual
   * @access Private (cualquier usuario autenticado)
   */
  static async getMisTrabajos(req, res, next) {
    try {
      const trabajos = await TrabajoService.getTrabajosByUsuario(
        req.user.id, 
        req.user
      );
      
      res.json({
        success: true,
        data: trabajos
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TrabajoController;