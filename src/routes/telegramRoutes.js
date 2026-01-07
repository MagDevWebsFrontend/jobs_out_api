const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Activar notificaciones y obtener código
router.post('/activate', telegramController.activateNotifications);

// Desactivar notificaciones
router.post('/deactivate', telegramController.deactivateNotifications);

// Obtener estado actual
router.get('/status', telegramController.getStatus);

// Enviar notificación de prueba
router.post('/test', telegramController.sendTestNotification);

// Actualizar configuración
router.put('/settings', telegramController.updateSettings);

module.exports = router;