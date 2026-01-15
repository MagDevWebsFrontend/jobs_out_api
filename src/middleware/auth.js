 // En src/middleware/auth.js
const JWTUtil = require('../utils/jwt');
const AppError = require('../errors/AppError');

/**
 * @middleware authenticate
 * @description Middleware para autenticar usuarios mediante JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Token no proporcionado');
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // 2. Verificar token
    const decoded = JWTUtil.verifyToken(token);

    // 3. Adjuntar usuario a la request
    req.user = decoded;

    // 4. Verificar si el token está próximo a expirar
    if (JWTUtil.isTokenAboutToExpire(token, 300)) { // 5 minutos
      res.setHeader('X-Token-Expiring-Soon', 'true');
    }

    next();
  } catch (error) {
    next(AppError.unauthorized('Token inválido o expirado'));
  }
};

/**
 * @middleware authorize
 * @description Middleware para autorizar roles específicos
 * @param {string[admin]} roles - Roles permitidos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Usuario no autenticado'));
    }

    if (!roles.includes(req.user.rol)) {
      return next(AppError.forbidden('No tienes permisos para esta acción'));
    }

    next();
  };
};

/**
 * @middleware optionalAuth
 * @description Middleware de autenticación opcional
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyToken(token);
      req.user = decoded;
    }
    
    //next();
  } catch (error) {
    console.log(error);
    // Si el token es inválido, continuar sin autenticación
    //next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
