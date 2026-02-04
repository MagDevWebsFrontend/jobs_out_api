// src/controllers/adminNotification.controller.js
const { broadcastNotification } = require('../services/notification.service');

exports.sendBroadcast = async (req, res, next) => {
  try {
    // body should have: message, audience, channels
    const { message, audience = 'notificados', channels } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message requerido' });
    }

    // channels must be array; if not provided, default to telegram
    let channelsArr = Array.isArray(channels) ? channels : [];
    if (channelsArr.length === 0) {
      channelsArr = ['telegram']; // default
    }

    const result = await broadcastNotification({
      message,
      audience,
      channels: channelsArr
    });

    return res.json({
      success: true,
      message: 'Broadcast enviado',
      result
    });
  } catch (error) {
    next(error);
  }
};
