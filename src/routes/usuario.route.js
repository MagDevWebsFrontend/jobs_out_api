// En src/routes/usuario.route.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { authenticate, authorize } = require('../middleware/auth');
const dbContext = require('../middleware/dbContext.middleware')

/**
 * @route /api/usuarios
 * @description Rutas para gestión de usuarios
 */

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

/**
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
router.get('/', authenticate, authorize('admin'), UsuarioController.getAllUsers);

/**
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
router.get('/:id', authenticate,dbContext, UsuarioController.getUserById);

/**
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
router.put('/:id', authenticate,dbContext, UsuarioController.updateUser);

/**
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
router.delete('/:id', authenticate,dbContext, UsuarioController.deleteUser);

/**
 * @swagger
 * /usuarios/{id}/restore:
 *   patch:
 *     summary: Restaurar usuario eliminado (admin only)
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
 */
router.patch('/:id/restore', authenticate, authorize('admin'), UsuarioController.restoreUser);

/**
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
router.put('/:id/notificaciones', authenticate,dbContext, UsuarioController.updateNotificationConfig);

module.exports = router;