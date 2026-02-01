// src/services/logs.service.js
const { Log, Usuario } = require('../models')

class LogsService {
  static async getLogs({ limit = 50, offset = 0 }) {
    return Log.findAndCountAll({
      limit: Number(limit),
      offset: Number(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'nombre']
        }
      ]
    })
  }
}

module.exports = LogsService
