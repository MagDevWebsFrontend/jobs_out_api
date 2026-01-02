 
// En src/utils/bcrypt.js
const bcrypt = require('bcrypt');
const logger = require('./logger');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

class BcryptUtil {
  /**
   * Hashea una contraseña
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} - Hash de la contraseña
   */
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      logger.error('Error hasheando contraseña:', error);
      throw new Error('Error al encriptar la contraseña');
    }
  }

  /**
   * Compara una contraseña con su hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hash - Hash almacenado
   * @returns {Promise<boolean>} - True si coinciden
   */
  static async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Error comparando contraseñas:', error);
      return false;
    }
  }

  /**
   * Verifica si un hash es válido
   * @param {string} hash - Hash a verificar
   * @returns {boolean} - True si es un hash válido
   */
  static isValidHash(hash) {
    return typeof hash === 'string' && 
           hash.startsWith('$2b$') && 
           hash.length === 60;
  }
}

module.exports = BcryptUtil;