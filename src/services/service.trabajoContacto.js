const { TrabajoContacto, Trabajo } = require('../models');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

class TrabajoContactoService {
  /**
   * Agregar contacto a un trabajo
   */
  async agregarContacto(trabajoId, contacto, usuarioId) {
    try {
      logger.info(`Agregando contacto al trabajo: ${trabajoId}`);
      
      // Verificar que el trabajo existe y pertenece al usuario
      const trabajo = await Trabajo.findOne({
        where: {
          id: trabajoId,
          autor_id: usuarioId
        }
      });

      if (!trabajo) {
        throw new AppError('Trabajo no encontrado o no autorizado', 404);
      }

      // Verificar si ya existe el contacto
      const existe = await TrabajoContacto.findOne({
        where: {
          trabajo_id: trabajoId,
          tipo: contacto.tipo,
          valor: contacto.valor
        }
      });

      if (existe) {
        throw new AppError('Este contacto ya existe para este trabajo', 409);
      }

      const nuevoContacto = await TrabajoContacto.create({
        trabajo_id: trabajoId,
        tipo: contacto.tipo,
        valor: contacto.valor
      });

      logger.info(`Contacto agregado exitosamente al trabajo: ${trabajoId}`);
      return nuevoContacto;
    } catch (error) {
      logger.error(`Error agregando contacto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener contactos de un trabajo
   */
  async obtenerContactosPorTrabajo(trabajoId, usuarioId = null) {
    try {
      logger.info(`Obteniendo contactos del trabajo: ${trabajoId}`);
      
      // Si se proporciona usuarioId, verificar permisos
      if (usuarioId) {
        const trabajo = await Trabajo.findOne({
          where: {
            id: trabajoId,
            autor_id: usuarioId
          }
        });

        if (!trabajo) {
          throw new AppError('Trabajo no encontrado o no autorizado', 404);
        }
      }

      const contactos = await TrabajoContacto.findAll({
        where: { trabajo_id: trabajoId },
        order: [['created_at', 'ASC']]
      });

      return contactos;
    } catch (error) {
      logger.error(`Error obteniendo contactos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar contacto de un trabajo
   */
  async actualizarContacto(trabajoId, tipo, valor, nuevoValor, usuarioId) {
    try {
      logger.info(`Actualizando contacto del trabajo: ${trabajoId}`);
      
      // Verificar que el trabajo pertenece al usuario
      const trabajo = await Trabajo.findOne({
        where: {
          id: trabajoId,
          autor_id: usuarioId
        }
      });

      if (!trabajo) {
        throw new AppError('Trabajo no encontrado o no autorizado', 404);
      }

      // Buscar el contacto
      const contacto = await TrabajoContacto.findOne({
        where: {
          trabajo_id: trabajoId,
          tipo: tipo,
          valor: valor
        }
      });

      if (!contacto) {
        throw new AppError('Contacto no encontrado', 404);
      }

      // Verificar que el nuevo contacto no exista ya
      const existeNuevo = await TrabajoContacto.findOne({
        where: {
          trabajo_id: trabajoId,
          tipo: tipo,
          valor: nuevoValor
        }
      });

      if (existeNuevo) {
        throw new AppError('Ya existe un contacto con este valor', 409);
      }

      // Actualizar valor
      await contacto.update({ valor: nuevoValor });

      logger.info(`Contacto actualizado exitosamente`);
      return contacto;
    } catch (error) {
      logger.error(`Error actualizando contacto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar contacto de un trabajo
   */
  async eliminarContacto(trabajoId, tipo, valor, usuarioId) {
    try {
      logger.info(`Eliminando contacto del trabajo: ${trabajoId}`);
      
      // Verificar que el trabajo pertenece al usuario
      const trabajo = await Trabajo.findOne({
        where: {
          id: trabajoId,
          autor_id: usuarioId
        }
      });

      if (!trabajo) {
        throw new AppError('Trabajo no encontrado o no autorizado', 404);
      }

      const contacto = await TrabajoContacto.findOne({
        where: {
          trabajo_id: trabajoId,
          tipo: tipo,
          valor: valor
        }
      });

      if (!contacto) {
        throw new AppError('Contacto no encontrado', 404);
      }

      await contacto.destroy();

      logger.info(`Contacto eliminado exitosamente`);
      return { 
        mensaje: 'Contacto eliminado exitosamente',
        trabajo_id: trabajoId,
        tipo: tipo,
        valor: valor
      };
    } catch (error) {
      logger.error(`Error eliminando contacto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de tipos de contacto
   */
  async obtenerEstadisticas() {
    try {
      logger.info('Obteniendo estadísticas de contactos');
      
      // Contar por tipo de contacto
      const contactosPorTipo = await TrabajoContacto.findAll({
        attributes: [
          'tipo',
          [sequelize.fn('COUNT', sequelize.col('tipo')), 'total']
        ],
        group: ['tipo'],
        order: [[sequelize.fn('COUNT', sequelize.col('tipo')), 'DESC']]
      });

      // Total de contactos
      const totalContactos = await TrabajoContacto.count();

      return {
        total: totalContactos,
        porTipo: contactosPorTipo.map(item => ({
          tipo: item.tipo,
          total: item.get('total')
        }))
      };
    } catch (error) {
      logger.error(`Error obteniendo estadísticas: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TrabajoContactoService();