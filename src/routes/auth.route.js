// En src/routes/auth.route.js (actualizar)
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const dbContext = require('../middleware/dbContext.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y autorización
 */

/**
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
 *               municipio_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Usuario o email ya existe
 */
router.post('/register', AuthController.register);


router.get('/availability', AuthController.checkUsernameAvailability)

/**
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
 *                 description: Username o email
 *                 example: "juanperez"
 *               password:
 *                 type: string
 *                 example: "miclave123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', AuthController.login);

/**
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
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/refresh', AuthController.refreshToken);

/**
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticate,dbContext, AuthController.getProfile);

/**
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
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/change-password', authenticate,dbContext, AuthController.changePassword);

/**
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
router.get('/logout', authenticate,dbContext, AuthController.logout);

module.exports = router;