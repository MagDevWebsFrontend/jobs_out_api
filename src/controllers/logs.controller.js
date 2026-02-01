const LogsService = require("../services/logs.service")

class LogsController {
  static async getLogs(req, res, next) {
  try {
    let { limit = 50, offset = 0 } = req.query

    limit = Math.min(Number(limit), 100) // ⛔ no más de 100

    const { rows, count } = await LogsService.getLogs({ limit, offset })

    res.json({
      success: true,
      total: count,
      limit,
      offset,
      data: rows
    })
  } catch (error) {
    next(error)
  }
  }

}

module.exports = LogsController
