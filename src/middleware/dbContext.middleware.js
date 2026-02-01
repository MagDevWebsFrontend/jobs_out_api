//src/middlewares/dbContext.middleware.js
const { sequelize } = require('../models');

module.exports = async function dbContext(req, res, next) {
  // Si no hay usuario autenticado, no seteamos contexto
  if (!req.user) {
    return next();
  }

  try {
    await sequelize.query(
      `
      SELECT establecer_contexto_usuario(
        :usuario_id,
        :ip,
        :user_agent
      )
      `,
      {
        replacements: {
          usuario_id: req.user.id,
          ip: req.ip || null,
          user_agent: req.headers['user-agent'] || null
        }
      }
    );

    next();
  } catch (error) {
    next(error);
  }
};
