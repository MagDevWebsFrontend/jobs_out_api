// En src/controllers/auth.controller.js
const AuthService = require('../services/service.auth');

/**
 * @controller AuthController
 * @description Controlador para autenticación y autorización
 */
class AuthController {
  /**
   * @route POST /api/auth/register
   * @description Registrar nuevo usuario
   * @access Public
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Registrar nuevo usuario
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - username
   *               - password_hash
   *             properties:
   *               nombre:
   *                 type: string
   *                 example: "Juan Pérez"
   *               username:
   *                 type: string
   *                 example: "juanperez"
   *               email:
   *                 type: string
   *                 example: "juan@example.com"
   *               password_hash:
   *                 type: string
   *                 example: "miclave123"
   *               telefono_e164:
   *                 type: string
   *                 example: "+584141234567"
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       409:
   *         description: Usuario o email ya existe
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/auth/login
   * @description Iniciar sesión
   * @access Public
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - identifier
   *               - password
   *             properties:
   *               identifier:
   *                 type: string
   *                 example: "juanperez"
   *               password:
   *                 type: string
   *                 example: "miclave123"
   *     responses:
   *       200:
   *         description: Login exitoso
   *       401:
   *         description: Credenciales incorrectas
   */
  static async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(identifier, password);
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/auth/refresh
   * @description Refrescar token JWT
   * @access Public
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Refrescar token JWT
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refrescado
   *       401:
   *         description: Refresh token inválido
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token refrescado',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/auth/me
   * @description Obtener perfil del usuario actual
   * @access Private
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Obtener perfil del usuario actual
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil obtenido
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/auth/change-password
   * @description Cambiar contraseña
   * @access Private
   * @swagger
   * /auth/change-password:
   *   post:
   *     summary: Cambiar contraseña
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Contraseña cambiada
   *       401:
   *         description: Contraseña actual incorrecta
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/auth/logout
   * @description Cerrar sesión (client-side)
   * @access Private
   * @swagger
   * /auth/logout:
   *   get:
   *     summary: Cerrar sesión
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sesión cerrada
   */
  static async logout(req, res, next) {
    try {
      // En JWT stateless, el logout es client-side
      // Aquí podríamos agregar el token a una blacklist si quisiéramos
      
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;