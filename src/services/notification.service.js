// src/services/notification.service.js
const { Op } = require('sequelize');
const { ConfiguracionUsuario } = require('../models');
const telegramBot = require('./telegram/telegramBot');

/**
 * Broadcast notification service
 * options:
 *  - message: string (HTML allowed)
 *  - audience: 'todos' | 'notificados'
 *  - channels: string[] (if empty -> defaults to ['telegram'])
 */
async function broadcastNotification({ message, audience = 'notificados', channels = [] }) {
  if (!Array.isArray(channels) || channels.length === 0) {
    channels = ['telegram'];
  }

  const result = {
    telegram: { attempted: 0, sent: 0, failed: 0, errors: [] },
    email: { attempted: 0, sent: 0, failed: 0, errors: [] },
    whatsapp: { attempted: 0, sent: 0, failed: 0, errors: [] }
  };

  // Build where for telegram users
  const telegramWhere = audience === 'notificados'
    ? { telegram_notif: true, telegram_chat_id: { [Op.ne]: null } }
    : { telegram_chat_id: { [Op.ne]: null } };

  // SEND TELEGRAM
  if (channels.includes('telegram')) {
    console.log('[broadcast] Fetching Telegram recipients with where:', telegramWhere);
    const usuarios = await ConfiguracionUsuario.findAll({
      where: telegramWhere,
      attributes: ['usuario_id', 'telegram_chat_id']
    });

    const chatIds = usuarios.map(c => c.telegram_chat_id).filter(Boolean);
    result.telegram.attempted = chatIds.length;

    const batchSize = 20;
    for (let i = 0; i < chatIds.length; i += batchSize) {
      const batch = chatIds.slice(i, i + batchSize);
      const promises = batch.map(chatId => {
        const idStr = String(chatId);
        return telegramBot.sendNotification(idStr, message)
          .then(ok => ({ chatId: idStr, ok }))
          .catch(err => ({ chatId: idStr, ok: false, err: err?.message || String(err) }));
      });

      const settled = await Promise.all(promises);

      settled.forEach(r => {
        if (r.ok) result.telegram.sent++;
        else {
          result.telegram.failed++;
          result.telegram.errors.push({ chatId: r.chatId, error: r.err || 'unknown' });
        }
      });

      // throttle
      await sleep(200);
    }
  }

  // email & whatsapp placeholders: keep counts 0 for now
  if (channels.includes('email')) {
    result.email.attempted = 0;
    result.email.sent = 0;
  }
  if (channels.includes('whatsapp')) {
    result.whatsapp.attempted = 0;
    result.whatsapp.sent = 0;
  }

  console.log('[broadcast] result:', result);
  return result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  broadcastNotification
};
