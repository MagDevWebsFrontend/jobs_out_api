// En src/services/service.auth.js
const JWTUtil = require('../utils/jwt');
const BcryptUtil = require('../utils/bcrypt');
const AppError = require('../errors/AppError');
const { Usuario, sequelize, ConfiguracionUsuario, Municipio } = require('../models');

class AuthService {
  /**
   * @description Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado y tokens
   */
  static async register(userData) {
  try {
    // =========================
    // NORMALIZAR INPUT
    // =========================
    const {
      nombre,
      username,
      email,
      password,
      telefono_e164,
      municipio_id
    } = userData;

    if (!password) {
      throw AppError.badRequest('La contraseña es obligatoria');
    }

    // =========================
    // VALIDAR MUNICIPIO
    // =========================
    if (municipio_id) {
      const municipio = await Municipio.findByPk(municipio_id);
      if (!municipio) {
        throw AppError.badRequest('Municipio inválido');
      }
    }

    // =========================
    // VALIDAR USERNAME
    // =========================
    const existingUser = await Usuario.findOne({
      where: { username }
    });

    if (existingUser) {
      throw AppError.conflict('El nombre de usuario ya está en uso');
    }

    // =========================
    // VALIDAR EMAIL
    // =========================
    if (email) {
      const existingEmail = await Usuario.findOne({
        where: { email }
      });

      if (existingEmail) {
        throw AppError.conflict('El email ya está registrado');
      }
    }

    // =========================
    // CREAR USUARIO
    // =========================
    const usuario = await Usuario.create({
      nombre,
      username,
      email,
      password_hash: password, // 👈 aquí el hook lo hashea
      telefono_e164,
      municipio_id
    });

    // =========================
    // CREAR CONFIGURACIÓN
    // =========================
    await ConfiguracionUsuario.create({
      usuario_id: usuario.id,
      telegram_notif: false
    });

    // =========================
    // TOKENS
    // =========================
    const token = JWTUtil.generateToken({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol
    });

    const refreshToken = JWTUtil.generateRefreshToken({
      id: usuario.id
    });

    // =========================
    // RESPONSE CLEAN
    // =========================
    const userResponse = usuario.toJSON();
    delete userResponse.password_hash;

    return {
      user: userResponse,
      token,
      refreshToken
    };

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw AppError.validationError(
        error.errors.map(e => e.message).join(', ')
      );
    }
    throw error;
  }
}

  /**
   * @description Iniciar sesión
   * @param {string} identifier - Username o email
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario y tokens
   */
  static async login(identifier, password) {
    try {
      // Buscar usuario por username (case-insensitive)
      const usuario = await Usuario.findByUsernameOrEmail(identifier);

      if (!usuario) {
        throw AppError.unauthorized('Credenciales incorrectas');
      }

      // Verificar contraseña
      const isPasswordValid = await usuario.verifyPassword(password);
      if (!isPasswordValid) {
        throw AppError.unauthorized('Credenciales incorrectas');
      }

      // Generar tokens
      const token = JWTUtil.generateToken({
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      });

      const refreshToken = JWTUtil.generateRefreshToken({
        id: usuario.id
      });

      // Actualizar última conexión
      await usuario.update({ updated_at: new Date() });

      // Remover password_hash de la respuesta
      const userResponse = usuario.toJSON();
      delete userResponse.password_hash;

      return {
        user: userResponse,
        token,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Refrescar token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Nuevo token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      const usuario = await Usuario.findByPk(decoded.id);
      if (!usuario) {
        throw AppError.unauthorized('Usuario no encontrado');
      }

      const newToken = JWTUtil.generateToken({
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      });

      return { token: newToken };
    } catch (error) {
      throw AppError.unauthorized('Refresh token inválido');
    }
  }

  /**
   * @description Obtener perfil del usuario actual
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Perfil del usuario
   */
  static async getProfile(userId) {
    try {
      const usuario = await Usuario.findByPk(userId, {
        attributes: { exclude: ['password_hash', 'deleted_at'] },
        include: [
          {
            association: 'configuracion',
            attributes: ['telegram_notif', 'created_at', 'updated_at']
          },
          {
            association: 'municipio',
            include: ['provincia']
          }
        ]
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
   * @description Cambiar contraseña
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se cambió correctamente
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const usuario = await Usuario.findByPk(userId);
      if (!usuario) {
        throw AppError.notFound('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValid = await usuario.verifyPassword(currentPassword);
      if (!isValid) {
        throw AppError.unauthorized('Contraseña actual incorrecta');
      }

      // Actualizar contraseña (el hook se encargará de hashearla)
      await usuario.update({ password_hash: newPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }


  static async isUsernameAvailable(username) {
  // Búsqueda case-insensitive
  const usuario = await Usuario.findOne({
    where: sequelize.where(
      sequelize.fn('LOWER', sequelize.col('username')),
      '=',
      String(username).toLowerCase()
    )
  })
  return !usuario
}

}

module.exports = AuthService;
