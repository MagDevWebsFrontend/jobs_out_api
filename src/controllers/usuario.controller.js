// En src/controllers/usuario.controller.js
const UsuarioService = require('../services/service.usuario');

/**
 * @controller UsuarioController
 * @description Controlador para gestión de usuarios
 */
class UsuarioController {
  /**
   * @route GET /api/usuarios
   * @description Obtener todos los usuarios (admin only)
   * @access Private (Admin)
   * @swagger
   * /usuarios:
   *   get:
   *     summary: Obtener todos los usuarios (admin only)
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *       - in: query
   *         name: rol
   *         schema:
   *           type: string
   *           enum: [admin, trabajador]
   *     responses:
   *       200:
   *         description: Lista de usuarios
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   */
  static async getAllUsers(req, res, next) {
    try {
      const { page, limit, ...filters } = req.query;
      const result = await UsuarioService.getAllUsers(filters, { page, limit });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/usuarios/:id
   * @description Obtener usuario por ID
   * @access Private
   * @swagger
   * /usuarios/{id}:
   *   get:
   *     summary: Obtener usuario por ID
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Usuario encontrado
   *       404:
   *         description: Usuario no encontrado
   */
  static async getUserById(req, res, next) {
    try {
      const includeSensitive = req.user.rol === 'admin' || req.user.id === req.params.id;
      const user = await UsuarioService.getUserById(req.params.id, includeSensitive);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/usuarios/:id
   * @description Actualizar usuario
   * @access Private
   * @swagger
   * /usuarios/{id}:
   *   put:
   *     summary: Actualizar usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *               email:
   *                 type: string
   *               telefono_e164:
   *                 type: string
   *               municipio_id:
   *                 type: string
   *                 format: uuid
   *               avatar_url:
   *                 type: string
   *     responses:
   *       200:
   *         description: Usuario actualizado
   *       403:
   *         description: No autorizado para modificar este usuario
   */
  static async updateUser(req, res, next) {
    try {
      const user = await UsuarioService.updateUser(req.params.id, req.body, req.user);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/usuarios/:id
   * @description Eliminar usuario (soft delete)
   * @access Private
   * @swagger
   * /usuarios/{id}:
   *   delete:
   *     summary: Eliminar usuario
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Usuario eliminado
   *       403:
   *         description: No autorizado para eliminar este usuario
   */
  static async deleteUser(req, res, next) {
    try {
      await UsuarioService.deleteUser(req.params.id, req.user);
      
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PATCH /api/usuarios/:id/restore
   * @description Restaurar usuario eliminado (admin only)
   * @access Private (Admin)
   * @swagger
   * /usuarios/{id}/restore:
   *   patch:
   *     summary: Restaurar usuario eliminado
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Usuario restaurado
   *       404:
   *         description: Usuario no encontrado
   */
  static async restoreUser(req, res, next) {
    try {
      const user = await UsuarioService.restoreUser(req.params.id);
      
      res.json({
        success: true,
        message: 'Usuario restaurado exitosamente',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/usuarios/:id/notificaciones
   * @description Actualizar configuración de notificaciones
   * @access Private
   * @swagger
   * /usuarios/{id}/notificaciones:
   *   put:
   *     summary: Actualizar configuración de notificaciones
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               telegram_notif:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Configuración actualizada
   */
  static async updateNotificationConfig(req, res, next) {
    try {
      if (req.user.id !== req.params.id && req.user.rol !== 'admin') {
        throw AppError.forbidden('No puedes modificar esta configuración');
      }

      const config = await UsuarioService.updateNotificationConfig(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Configuración de notificaciones actualizada',
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsuarioController;