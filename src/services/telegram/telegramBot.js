const TelegramBot = require('node-telegram-bot-api');
const { ConfiguracionUsuario, Usuario } = require('../../models');

// Token del bot (debes configurarlo en .env)
const token = process.env.TELEGRAM_BOT_TOKEN || '';

// Crear el bot con polling
const bot = new TelegramBot(token, { polling: true });

// Objeto para almacenar códigos temporalmente
const verificationCodes = {};

// ======================
// MANEJADORES DE COMANDOS
// ======================

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Usuario';
  
  console.log(`👋 Nuevo usuario: @${username} (Chat ID: ${chatId})`);
  
  bot.sendMessage(
    chatId,
    `¡Hola ${username}! Soy el bot de notificaciones de Jobs Out Cuba.\n\n` +
    '📱 *Para suscribirte a las notificaciones:*\n' +
    '1. Ve a tu perfil en la web\n' +
    '2. Activa las notificaciones de Telegram\n' +
    '3. Copia el código de 6 dígitos\n' +
    '4. Envíamelo aquí\n\n' +
    '❓ *Comandos disponibles:*\n' +
    '/help - Ver ayuda\n' +
    '/unsubscribe - Cancelar suscripción\n' +
    '/status - Ver estado actual',
    { parse_mode: 'Markdown' }
  );
});

// Comando /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    '🤖 *AYUDA DEL BOT*\n\n' +
    'Para suscribirte a las notificaciones:\n' +
    '1. Activa Telegram en tu perfil web\n' +
    '2. Copia el código de 6 dígitos\n' +
    '3. Envíalo aquí como mensaje normal\n\n' +
    '📋 *Comandos:*\n' +
    '/start - Iniciar bot\n' +
    '/help - Esta ayuda\n' +
    '/status - Ver tu estado\n' +
    '/unsubscribe - Cancelar suscripción\n\n' +
    '📞 *Soporte:*\n' +
    'Si tienes problemas, contacta al administrador.',
    { parse_mode: 'Markdown' }
  );
});

// Comando /status
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const config = await ConfiguracionUsuario.findOne({
      where: { telegram_chat_id: chatId.toString() }
    });

    if (config && config.telegram_notif) {
      const usuario = await Usuario.findByPk(config.usuario_id, {
        attributes: ['nombre', 'username']
      });
      
      bot.sendMessage(
        chatId,
        `✅ *ESTADO ACTUAL*\n\n` +
        `Nombre: ${usuario.nombre}\n` +
        `Usuario: @${usuario.username || 'No tiene'}\n` +
        `Chat ID: ${chatId}\n` +
        `Notificaciones: ACTIVADAS\n\n` +
        `Recibirás notificaciones de:\n` +
        `• Nuevos trabajos\n` +
        `• Mensajes importantes\n` +
        `• Actualizaciones`,
        { parse_mode: 'Markdown' }
      );
    } else {
      bot.sendMessage(
        chatId,
        `❌ *ESTADO ACTUAL*\n\n` +
        `Notificaciones: DESACTIVADAS\n\n` +
        `Para activarlas:\n` +
        `1. Ve a tu perfil web\n` +
        `2. Activa notificaciones de Telegram\n` +
        `3. Envía el código aquí`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Error en /status:', error);
    bot.sendMessage(chatId, '❌ Error al verificar estado. Intenta más tarde.');
  }
});

// Comando /unsubscribe
bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const config = await ConfiguracionUsuario.findOne({
      where: { telegram_chat_id: chatId.toString() }
    });

    if (config) {
      config.telegram_notif = false;
      config.telegram_chat_id = null;
      await config.save();
      
      bot.sendMessage(
        chatId,
        '✅ *Suscripción cancelada*\n\n' +
        'Ya no recibirás más notificaciones.\n' +
        'Para volver a suscribirte, activa las notificaciones en tu perfil web.',
        { parse_mode: 'Markdown' }
      );
      
      console.log(`🔕 Usuario desuscripto: Chat ID ${chatId}`);
    } else {
      bot.sendMessage(
        chatId,
        'ℹ️ No estás suscrito a las notificaciones.',
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Error en /unsubscribe:', error);
    bot.sendMessage(chatId, '❌ Error al cancelar suscripción.');
  }
});

// ======================
// MANEJADOR DE CÓDIGOS DE 6 DÍGITOS
// ======================

// Escuchar mensajes con códigos de 6 dígitos
bot.onText(/^(\d{6})$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const codigo = match[1];
  
  console.log(`🔑 Código recibido: ${codigo} de Chat ID: ${chatId}`);
  
  // Buscar el código en la memoria
  const userId = verificationCodes[codigo];
  
  if (!userId) {
    bot.sendMessage(
      chatId,
      '❌ *Código inválido*\n\n' +
      'El código no existe o ha expirado.\n' +
      'Genera uno nuevo en tu perfil web.',
      { parse_mode: 'Markdown' }
    );
    return;
  }
  
  try {
    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar o crear configuración
    const [config, created] = await ConfiguracionUsuario.findOrCreate({
      where: { usuario_id: userId },
      defaults: {
        telegram_notif: true,
        telegram_chat_id: chatId.toString()
      }
    });
    
    if (!created) {
      config.telegram_notif = true;
      config.telegram_chat_id = chatId.toString();
      await config.save();
    }
    
    // Eliminar código después de uso
    delete verificationCodes[codigo];
    
    // Enviar mensaje de confirmación
    bot.sendMessage(
      chatId,
      `🎉 *¡Suscripción exitosa!*\n\n` +
      `Hola *${usuario.nombre}*,\n\n` +
      `✅ Ahora estás suscrito a las notificaciones.\n\n` +
      `Te notificaremos sobre:\n` +
      `• Nuevos trabajos en tu área\n` +
      `• Actualizaciones importantes\n` +
      `• Mensajes de contacto\n\n` +
      `Para cancelar: /unsubscribe\n` +
      `Ver estado: /status`,
      { parse_mode: 'Markdown' }
    );
    
    console.log(`✅ Usuario suscrito: ${usuario.username} -> Chat ID ${chatId}`);
    
  } catch (error) {
    console.error('Error suscribiendo usuario:', error);
    bot.sendMessage(
      chatId,
      '❌ *Error en la suscripción*\n\n' +
      'Hubo un problema al procesar tu código.\n' +
      'Intenta nuevamente o contacta al soporte.',
      { parse_mode: 'Markdown' }
    );
  }
});

// ======================
// MANEJADOR DE MENSAJES GENERALES
// ======================

bot.on('message', (msg) => {
  // Ignorar mensajes que ya fueron procesados por otros manejadores
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  // Ignorar códigos de 6 dígitos (ya manejados)
  if (msg.text && /^\d{6}$/.test(msg.text)) {
    return;
  }
  
  const chatId = msg.chat.id;
  
  // Responder a otros mensajes
  bot.sendMessage(
    chatId,
    '📝 *Para suscribirte:*\n\n' +
    '1. Ve a tu perfil en la web\n' +
    '2. Activa notificaciones de Telegram\n' +
    '3. Copia el código de 6 dígitos\n' +
    '4. Envíalo aquí\n\n' +
    '❓ *Comandos útiles:*\n' +
    '/start - Iniciar bot\n' +
    '/help - Ver ayuda\n' +
    '/status - Ver tu estado',
    { parse_mode: 'Markdown' }
  );
});

// ======================
// FUNCIONES DE UTILIDAD
// ======================

/**
 * Genera un código de verificación de 6 dígitos para un usuario
 * @param {string} userId - ID del usuario
 * @returns {string} Código de 6 dígitos
 */
function generateVerificationCode(userId) {
  // Generar código único de 6 dígitos
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (verificationCodes[code]); // Evitar duplicados
  
  // Guardar código con expiración (10 minutos)
  verificationCodes[code] = userId;
  
  // Programar eliminación automática después de 10 minutos
  setTimeout(() => {
    if (verificationCodes[code] === userId) {
      delete verificationCodes[code];
      console.log(`⏰ Código ${code} expirado`);
    }
  }, 10 * 60 * 1000); // 10 minutos
  
  console.log(`🔑 Código generado: ${code} para usuario ${userId}`);
  return code;
}

/**
 * Envía una notificación a un usuario
 * @param {string} chatId - ID del chat de Telegram
 * @param {string} message - Mensaje a enviar
 * @param {object} options - Opciones adicionales
 */
async function sendNotification(chatId, message, options = {}) {
  try {
    const defaultOptions = {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    await bot.sendMessage(chatId, message, finalOptions);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando notificación a ${chatId}:`, error.message);
    
    // Si el usuario bloqueó el bot, desactivar notificaciones
    if (error.response?.body?.error_code === 403) {
      try {
        const config = await ConfiguracionUsuario.findOne({
          where: { telegram_chat_id: chatId.toString() }
        });
        
        if (config) {
          config.telegram_notif = false;
          config.telegram_chat_id = null;
          await config.save();
          console.log(`🔕 Notificaciones desactivadas para Chat ID: ${chatId}`);
        }
      } catch (dbError) {
        console.error('Error desactivando notificaciones:', dbError);
      }
    }
    
    return false;
  }
}

/**
 * Envía notificación de nuevo trabajo
 * @param {string} chatId - ID del chat
 * @param {object} trabajo - Datos del trabajo
 */
async function sendJobNotification(chatId, trabajo) {
  const message = `
🎯 <b>NUEVO TRABAJO PUBLICADO</b>

📌 <b>${trabajo.titulo}</b>

📍 ${trabajo.municipio || 'Ubicación no especificada'}
⏰ ${formatJornada(trabajo.jornada)}
🏢 ${formatModo(trabajo.modo)}

📝 ${trabajo.descripcion?.substring(0, 150)}${trabajo.descripcion?.length > 150 ? '...' : ''}

🔗 <a href="${process.env.FRONTEND_URL || 'https://tudominio.com'}/trabajos/${trabajo.id}">Ver detalles</a>
  `;
  
  return sendNotification(chatId, message);
}

/**
 * Formatea el tipo de jornada
 */
function formatJornada(jornada) {
  const map = {
    'tiempo_completo': '⏱️ Tiempo Completo',
    'tiempo_parcial': '⏱️ Tiempo Parcial',
    'por_turnos': '🔄 Por Turnos'
  };
  return map[jornada] || jornada;
}

/**
 * Formatea el modo de trabajo
 */
function formatModo(modo) {
  const map = {
    'presencial': '🏢 Presencial',
    'remoto': '🏠 Remoto',
    'hibrido': '🔀 Híbrido'
  };
  return map[modo] || modo;
}

/**
 * Obtiene el username del bot
 */
function getBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || '@JobsOutCubaBot';
}

/**
 * Obtiene el link del bot
 */
function getBotLink() {
  const username = getBotUsername().replace('@', '');
  return `https://t.me/${username}`;
}

/**
 * Verifica si el bot está activo
 */
function isBotActive() {
  return !!token && bot != null;
}

// ======================
// MANEJADOR DE ERRORES
// ======================

bot.on('polling_error', (error) => {
  console.error('❌ Error en polling de Telegram:', error.code, error.message);
});

bot.on('webhook_error', (error) => {
  console.error('❌ Error en webhook de Telegram:', error);
});

// ======================
// INICIALIZACIÓN
// ======================

console.log('🤖 Bot de Telegram inicializado con polling');

// Exportar funciones
module.exports = {
  bot,
  generateVerificationCode,
  sendNotification,
  sendJobNotification,
  getBotUsername,
  getBotLink,
  isBotActive
};