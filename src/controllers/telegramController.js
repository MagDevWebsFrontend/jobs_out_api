const telegramBot = require('../services/telegram/telegramBot');
const { ConfiguracionUsuario, Usuario } = require('../models');

/**
 * Activar notificaciones y generar código
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
    
    // Obtener información del usuario
    const usuario = await Usuario.findByPk(userId, {
      attributes: ['nombre', 'username']
    });
    
    // Datos para la respuesta
    const response = {
      success: true,
      data: {
        code,
        botUsername: telegramBot.getBotUsername(),
        botLink: telegramBot.getBotLink(),
        instructions: `Envía este código al bot: ${code}`,
        usuario: {
          nombre: usuario.nombre,
          username: usuario.username
        },
        expiresIn: '10 minutos'
      }
    };
    
    console.log(`📱 Código generado para ${usuario.username}: ${code}`);
    res.json(response);
    
  } catch (error) {
    console.error('Error activando notificaciones:', error);
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
    
    // Buscar configuración del usuario
    const config = await ConfiguracionUsuario.findOne({
      where: { usuario_id: userId }
    });
    
    if (config) {
      config.telegram_notif = false;
      config.telegram_chat_id = null;
      await config.save();
      
      console.log(`🔕 Notificaciones desactivadas para usuario ${userId}`);
    }
    
    res.json({
      success: true,
      message: 'Notificaciones desactivadas'
    });
    
  } catch (error) {
    console.error('Error desactivando notificaciones:', error);
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
    
    // Buscar configuración
    const config = await ConfiguracionUsuario.findOne({
      where: { usuario_id: userId },
      attributes: ['telegram_notif', 'telegram_chat_id']
    });
    
    // Si no existe, crear una por defecto
    if (!config) {
      await ConfiguracionUsuario.create({
        usuario_id: userId,
        telegram_notif: false
      });
    }
    
    const response = {
      success: true,
      data: {
        telegram_notif: config ? config.telegram_notif : false,
        telegram_chat_id: config ? config.telegram_chat_id : null,
        botActive: telegramBot.isBotActive(),
        botUsername: telegramBot.getBotUsername(),
        botLink: telegramBot.getBotLink()
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error obteniendo estado:', error);
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
    
    // Buscar configuración
    const config = await ConfiguracionUsuario.findOne({
      where: { 
        usuario_id: userId,
        telegram_notif: true,
        telegram_chat_id: { $ne: null }
      }
    });
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'No tienes notificaciones activas'
      });
    }
    
    // Obtener información del usuario
    const usuario = await Usuario.findByPk(userId, {
      attributes: ['nombre']
    });
    
    // Crear mensaje de prueba
    const message = `
🔔 <b>PRUEBA DE NOTIFICACIÓN</b>

Hola <b>${usuario.nombre}</b>,

✅ Tu configuración de notificaciones está funcionando correctamente.

📅 Fecha: ${new Date().toLocaleDateString('es-ES')}
🕒 Hora: ${new Date().toLocaleTimeString('es-ES')}

📍 <i>Jobs Out Cuba</i>
    `;
    
    // Enviar notificación
    const sent = await telegramBot.sendNotification(config.telegram_chat_id, message);
    
    if (sent) {
      res.json({
        success: true,
        message: 'Notificación de prueba enviada'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al enviar notificación'
      });
    }
    
  } catch (error) {
    console.error('Error enviando prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación de prueba'
    });
  }
};

/**
 * Actualizar configuración de notificaciones
 */
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { telegram_notif } = req.body;
    
    if (telegram_notif === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el campo telegram_notif'
      });
    }
    
    // Buscar o crear configuración
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
      message: `Notificaciones ${telegram_notif ? 'activadas' : 'desactivadas'}`
    });
    
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración'
    });
  }
};