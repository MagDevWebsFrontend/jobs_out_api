 // En src/errors/errorHandler.js
const AppError = require('./AppError');

const errorHandler = (err, req, res, next) => {
  // Si el error ya es un AppError, usarlo
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        status: err.status,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Para errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map(e => e.message) : [err.message];
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(', '),
        statusCode: 400,
        status: 'fail',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Error por defecto
  console.error('Error no manejado:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: {
      message: isDevelopment ? err.message : 'Error interno del servidor',
      statusCode: 500,
      status: 'error',
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
