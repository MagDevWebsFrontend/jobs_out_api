// controllers/telegramController.js
const { Op } = require('sequelize');
const telegramBot = require('../services/telegram/telegramBot');
const { ConfiguracionUsuario, Usuario } = require('../models');

/**
 * Solicitar activación de notificaciones (genera código)
 */
exports.activateNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el bot esté activo
    if (!telegramBot.isBotActive()) {
      return res.status(503).json({
        success: false,
        message: 'Servicio de notificaciones no disponible'
      });
    }

    // Generar código de verificación
    const code = telegramBot.generateVerificationCode(userId);

    // Obtener usuario
    const usuario = await Usuario.findByPk(userId, {
      attributes: ['nombre', 'username']
    });

    res.json({
      success: true,
      data: {
        code,
        botUsername: telegramBot.getBotUsername(),
        botLink: telegramBot.getBotLink(),
        instructions: `Envía este código al bot de Telegram`,
        usuario: {
          nombre: usuario?.nombre || '',
          username: usuario?.username || ''
        },
        expiresIn: '10 minutos'
      }
    });

    console.log(`📱 Código Telegram generado para user ${userId}: ${code}`);

  } catch (error) {
    console.error('❌ Error activando notificaciones Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar notificaciones'
    });
  }
};

/**
 * Desactivar notificaciones
 */
exports.deactivateNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const config = await ConfiguracionUsuario.findOne({
      where: { usuario_id: userId }
    });

    if (config) {
      config.telegram_notif = false;
      config.telegram_chat_id = null;
      await config.save();

      console.log(`🔕 Telegram desactivado para usuario ${userId}`);
    }

    res.json({
      success: true,
      message: 'Notificaciones desactivadas'
    });

  } catch (error) {
    console.error('❌ Error desactivando Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar notificaciones'
    });
  }
};

/**
 * Obtener estado de notificaciones
 */
exports.getStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    let config = await ConfiguracionUsuario.findOne({
      where: { usuario_id: userId },
      attributes: ['telegram_notif', 'telegram_chat_id']
    });

    // Crear configuración por defecto si no existe
    if (!config) {
      config = await ConfiguracionUsuario.create({
        usuario_id: userId,
        telegram_notif: false
      });
    }

    res.json({
      success: true,
      data: {
        telegram_notif: config.telegram_notif,
        telegram_chat_id: config.telegram_chat_id,
        botActive: telegramBot.isBotActive(),
        botUsername: telegramBot.getBotUsername(),
        botLink: telegramBot.getBotLink()
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estado Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado'
    });
  }
};

/**
 * Enviar notificación de prueba
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;

    const config = await ConfiguracionUsuario.findOne({
      where: {
        usuario_id: userId,
        telegram_notif: true,
        telegram_chat_id: { [Op.ne]: null }
      }
    });

    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'No tienes notificaciones activas'
      });
    }

    const usuario = await Usuario.findByPk(userId, {
      attributes: ['nombre']
    });

    const message = `
🔔 <b>PRUEBA DE NOTIFICACIÓN</b>

Hola <b>${usuario?.nombre || 'usuario'}</b>,

✅ Las notificaciones de Telegram están funcionando correctamente.

📅 Fecha: ${new Date().toLocaleDateString('es-ES')}
🕒 Hora: ${new Date().toLocaleTimeString('es-ES')}

📍 <i>Jobs Out Cuba</i>
`;

    const sent = await telegramBot.sendNotification(
      config.telegram_chat_id,
      message
    );

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar la notificación'
      });
    }

    res.json({
      success: true,
      message: 'Notificación de prueba enviada'
    });

  } catch (error) {
    console.error('❌ Error enviando prueba Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación de prueba'
    });
  }
};

/**
 * Actualizar configuración (toggle desde frontend)
 */
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { telegram_notif } = req.body;

    if (typeof telegram_notif !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'telegram_notif debe ser boolean'
      });
    }

    const [config, created] = await ConfiguracionUsuario.findOrCreate({
      where: { usuario_id: userId },
      defaults: { telegram_notif }
    });

    if (!created) {
      config.telegram_notif = telegram_notif;
      await config.save();
    }

    res.json({
      success: true,
      message: telegram_notif
        ? 'Notificaciones activadas'
        : 'Notificaciones desactivadas'
    });

  } catch (error) {
    console.error('❌ Error actualizando configuración Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración'
    });
  }
};
