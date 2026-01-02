// En src/services/service.usuario.js
const { Usuario, ConfiguracionUsuario, Municipio, Provincia } = require('../models');
const AppError = require('../errors/AppError');
const BcryptUtil = require('../utils/bcrypt');

class UsuarioService {
  /**
   * @description Obtener todos los usuarios (admin only)
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Paginación
   * @returns {Promise<Object>} Lista de usuarios
   */
  static async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const where = {};
      
      // Aplicar filtros
      if (filters.rol) where.rol = filters.rol;
      if (filters.municipio_id) where.municipio_id = filters.municipio_id;
      if (filters.estado) where.estado = filters.estado;

      const { count, rows } = await Usuario.findAndCountAll({
        where,
        attributes: { exclude: ['password_hash', 'deleted_at'] },
        include: [
          {
            association: 'municipio',
            include: ['provincia']
          },
          {
            association: 'configuracion',
            attributes: ['telegram_notif']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        paranoid: false // Incluir usuarios eliminados si es admin
      });

      return {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Obtener usuario por ID
   * @param {string} userId - ID del usuario
   * @param {boolean} includeSensitive - Incluir información sensible
   * @returns {Promise<Object>} Usuario
   */
  static async getUserById(userId, includeSensitive = false) {
    try {
      const attributes = { exclude: ['deleted_at'] };
      if (!includeSensitive) {
        attributes.exclude.push('password_hash');
      }

      const usuario = await Usuario.findByPk(userId, {
        attributes,
        include: [
          {
            association: 'municipio',
            include: ['provincia']
          },
          {
            association: 'configuracion'
          },
          {
            association: 'trabajos',
            limit: 5,
            order: [['created_at', 'DESC']]
          }
        ],
        paranoid: false
      });

      if (!usuario) {
        throw AppError.notFound('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Actualizar usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @param {Object} currentUser - Usuario actual que realiza la acción
   * @returns {Promise<Object>} Usuario actualizado
   */
  static async updateUser(userId, updateData, currentUser) {
    try {
      const usuario = await Usuario.findByPk(userId);
      if (!usuario) {
        throw AppError.notFound('Usuario no encontrado');
      }

      // Verificar permisos
      if (currentUser.id !== userId && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No puedes modificar este usuario');
      }

      // Si un no-admin intenta cambiar el rol, no permitirlo
      if (updateData.rol && currentUser.rol !== 'admin') {
        delete updateData.rol;
      }

      // Si se está actualizando el email, verificar que no exista
      if (updateData.email) {
        const existingEmail = await Usuario.findOne({
          where: { 
            email: updateData.email,
            id: { $ne: userId }
          }
        });

        if (existingEmail) {
          throw AppError.conflict('El email ya está registrado');
        }
      }

      // Si se está actualizando el username, verificar que no exista
      if (updateData.username) {
        const existingUsername = await Usuario.findOne({
          where: { 
            username: updateData.username,
            id: { $ne: userId }
          }
        });

        if (existingUsername) {
          throw AppError.conflict('El nombre de usuario ya está en uso');
        }
      }

      await usuario.update(updateData);

      // Remover password_hash de la respuesta
      const userResponse = usuario.toJSON();
      delete userResponse.password_hash;

      return userResponse;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        throw AppError.validationError(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }

  /**
   * @description Eliminar usuario (soft delete)
   * @param {string} userId - ID del usuario
   * @param {Object} currentUser - Usuario actual
   * @returns {Promise<boolean>} True si se eliminó
   */
  static async deleteUser(userId, currentUser) {
    try {
      if (currentUser.id !== userId && currentUser.rol !== 'admin') {
        throw AppError.forbidden('No puedes eliminar este usuario');
      }

      const usuario = await Usuario.findByPk(userId);
      if (!usuario) {
        throw AppError.notFound('Usuario no encontrado');
      }

      // No permitir que un usuario se elimine a sí mismo si es admin
      if (currentUser.id === userId && currentUser.rol === 'admin') {
        const adminCount = await Usuario.count({ where: { rol: 'admin' } });
        if (adminCount <= 1) {
          throw AppError.forbidden('No puedes eliminar al único administrador');
        }
      }

      await usuario.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Restaurar usuario eliminado
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Usuario restaurado
   */
  static async restoreUser(userId) {
    try {
      const usuario = await Usuario.findByPk(userId, { paranoid: false });
      if (!usuario) {
        throw AppError.notFound('Usuario no encontrado');
      }

      if (!usuario.deleted_at) {
        throw AppError.badRequest('El usuario no está eliminado');
      }

      await usuario.restore();
      
      // Remover password_hash de la respuesta
      const userResponse = usuario.toJSON();
      delete userResponse.password_hash;

      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Actualizar configuración de notificaciones
   * @param {string} userId - ID del usuario
   * @param {Object} configData - Datos de configuración
   * @returns {Promise<Object>} Configuración actualizada
   */
  static async updateNotificationConfig(userId, configData) {
    try {
      const [configuracion, created] = await ConfiguracionUsuario.findOrCreate({
        where: { usuario_id: userId },
        defaults: {
          usuario_id: userId,
          telegram_notif: false
        }
      });

      await configuracion.update(configData);
      return configuracion;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UsuarioService;