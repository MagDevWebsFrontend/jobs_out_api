const express = require('express')
const router = express.Router()
const LogsController = require('../controllers/logs.controller')
const { authenticate, authorize } = require('../middleware/auth')

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Obtener trazas del sistema
 *     tags: [Sistema]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/admin/logs',
  authenticate,
  authorize('admin'),
  LogsController.getLogs
)

module.exports = router
