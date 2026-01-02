 // En src/utils/jwt.js
const jwt = require('jsonwebtoken');
const logger = require('./logger');

class JWTUtil {
  /**
   * Genera un token JWT
   * @param {object} payload - Datos a incluir en el token
   * @param {string} expiresIn - Tiempo de expiración (ej: '7d', '1h')
   * @returns {string} - Token JWT
   */
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
      logger.error('Error generando token:', error);
      throw new Error('Error al generar el token');
    }
  }

  /**
   * Genera un refresh token
   * @param {object} payload - Datos a incluir en el token
   * @returns {string} - Refresh token
   */
  static generateRefreshToken(payload) {
    try {
      return jwt.sign(
        payload, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      );
    } catch (error) {
      logger.error('Error generando refresh token:', error);
      throw new Error('Error al generar el refresh token');
    }
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token a verificar
   * @returns {object} - Payload decodificado
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error('Error verificando token:', error.message);
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Verifica un refresh token
   * @param {string} token - Refresh token a verificar
   * @returns {object} - Payload decodificado
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(
        token, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
    } catch (error) {
      logger.error('Error verificando refresh token:', error.message);
      throw new Error('Refresh token inválido o expirado');
    }
  }

  /**
   * Decodifica un token sin verificar (solo para inspección)
   * @param {string} token - Token a decodificar
   * @returns {object} - Payload decodificado
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Extrae el token del header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} - Token extraído o null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remover 'Bearer '
  }

  /**
   * Verifica si un token está próximo a expirar
   * @param {string} token - Token a verificar
   * @param {number} thresholdSeconds - Umbral en segundos
   * @returns {boolean} - True si está próximo a expirar
   */
  static isTokenAboutToExpire(token, thresholdSeconds = 300) { // 5 minutos por defecto
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return false;
      
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp - now < thresholdSeconds;
    } catch (error) {
      logger.error('Error verificando expiración de token:', error);
      return false;
    }
  }
}

module.exports = JWTUtil;
