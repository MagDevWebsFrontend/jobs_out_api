// services/telegram/telegramBot
const TelegramBot = require('node-telegram-bot-api');
const { ConfiguracionUsuario, Usuario } = require('../../models');

// ======================
// CONFIGURACIÓN
// ======================

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN no está definido en .env');
}

const bot = new TelegramBot(token, { polling: true });

// Códigos temporales en memoria
const verificationCodes = {};

// ======================
// COMANDO /start
// ======================

bot.onText(/\/start/, async (msg) => {
  const chatId = String(msg.chat.id);
  const username = msg.from.username || 'Usuario';

  const config = await ConfiguracionUsuario.findOne({
    where: { telegram_chat_id: chatId }
  });

  if (config && config.telegram_notif) {
    return bot.sendMessage(
      chatId,
      '✅ Ya tienes las notificaciones activadas.\n\nUsa /status para ver tu estado.'
    );
  }

  bot.sendMessage(
    chatId,
    `👋 Hola ${username}\n\n` +
    'Para activar las notificaciones:\n' +
    '1️⃣ Ve a tu perfil en la web\n' +
    '2️⃣ Activa Telegram\n' +
    '3️⃣ Copia el código de 6 dígitos\n' +
    '4️⃣ Envíamelo aquí'
  );
});

// ======================
// COMANDO /help
// ======================

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    String(msg.chat.id),
    '🤖 AYUDA\n\n' +
    '/start - Iniciar bot\n' +
    '/status - Ver estado\n' +
    '/unsubscribe - Cancelar suscripción'
  );
});

// ======================
// COMANDO /status
// ======================

bot.onText(/\/status/, async (msg) => {
  const chatId = String(msg.chat.id);

  const config = await ConfiguracionUsuario.findOne({
    where: { telegram_chat_id: chatId }
  });

  if (!config || !config.telegram_notif) {
    return bot.sendMessage(
      chatId,
      '❌ No tienes las notificaciones activadas.\n\nActívalas desde la web.'
    );
  }

  const usuario = await Usuario.findByPk(config.usuario_id);

  if (!usuario) {
    return bot.sendMessage(chatId, '⚠️ Usuario no encontrado.');
  }

  bot.sendMessage(
    chatId,
    `✅ NOTIFICACIONES ACTIVAS\n\n` +
    `👤 ${usuario.nombre}\n` +
    `🆔 Chat ID: ${chatId}`
  );
});

// ======================
// COMANDO /unsubscribe
// ======================

bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = String(msg.chat.id);

  const config = await ConfiguracionUsuario.findOne({
    where: { telegram_chat_id: chatId }
  });

  if (!config) {
    return bot.sendMessage(chatId, 'ℹ️ No estás suscrito.');
  }

  config.telegram_notif = false;
  config.telegram_chat_id = null;
  await config.save();

  bot.sendMessage(
    chatId,
    '🔕 Notificaciones desactivadas correctamente.'
  );
});

// ======================
// CÓDIGOS DE 6 DÍGITOS
// ======================

bot.onText(/^(\d{6})$/, async (msg, match) => {
  const chatId = String(msg.chat.id);
  const code = match[1];
  const userId = verificationCodes[code];

  if (!userId) {
    return bot.sendMessage(chatId, '❌ Código inválido o expirado.');
  }

  const usuario = await Usuario.findByPk(userId);
  if (!usuario) {
    return bot.sendMessage(chatId, '❌ Usuario no encontrado.');
  }

  const [config] = await ConfiguracionUsuario.findOrCreate({
    where: { usuario_id: userId },
    defaults: {
      telegram_notif: true,
      telegram_chat_id: chatId
    }
  });

  config.telegram_notif = true;
  config.telegram_chat_id = chatId;
  await config.save();

  delete verificationCodes[code];

  bot.sendMessage(
    chatId,
    `🎉 Suscripción completada.\n\nHola ${usuario.nombre}, recibirás notificaciones automáticamente.`
  );
});

// ======================
// FUNCIONES EXPORTADAS
// ======================

function generateVerificationCode(userId) {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (verificationCodes[code]);

  verificationCodes[code] = userId;

  setTimeout(() => {
    delete verificationCodes[code];
  }, 10 * 60 * 1000);

  return code;
}

async function sendNotification(chatId, message) {
  try {
    await bot.sendMessage(String(chatId), message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    });
    return true;
  } catch (error) {
    console.error(`Error sending Telegram message to ${chatId}:`, error?.response?.body || error.message);
    if (error.response?.body?.error_code === 403) {
      try {
        const config = await ConfiguracionUsuario.findOne({
          where: { telegram_chat_id: String(chatId) }
        });
        if (config) {
          config.telegram_notif = false;
          config.telegram_chat_id = null;
          await config.save();
          console.log(`[telegramBot] Disabled notifications for ${chatId} (blocked the bot)`);
        }
      } catch (dbErr) {
        console.error('Error disabling notifications after 403:', dbErr);
      }
    }
    return false;
  }
}


// ======================
// FUNCIONES DE UTILIDAD
// ======================

function getBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || null;
}

function getBotLink() {
  const username = getBotUsername();
  return username ? `https://t.me/${username}` : null;
}

function isBotActive() {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

// Notificación específica de trabajos (wrapper)
async function sendJobNotification(chatId, job) {
  const message =
    `💼 *Nueva oferta disponible*\n\n` +
    `📌 ${job.titulo}\n` +
    `📍 ${job.municipio}\n\n` +
    `🔗 Ver en la plataforma`;

  return sendNotification(chatId, message);
}


module.exports = {
  bot,
  generateVerificationCode,
  sendNotification,
  sendJobNotification,
  getBotUsername,
  getBotLink,
  isBotActive
};
