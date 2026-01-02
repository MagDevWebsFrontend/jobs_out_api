 // En src/errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  static badRequest(message = 'Solicitud incorrecta') {
    return new AppError(message, 400);
  }
  
  static unauthorized(message = 'No autorizado') {
    return new AppError(message, 401);
  }
  
  static forbidden(message = 'Prohibido') {
    return new AppError(message, 403);
  }
  
  static notFound(message = 'Recurso no encontrado') {
    return new AppError(message, 404);
  }
  
  static conflict(message = 'Conflicto de recursos') {
    return new AppError(message, 409);
  }
  
  static validationError(message = 'Error de validación') {
    return new AppError(message, 422);
  }
  
  static internalError(message = 'Error interno del servidor') {
    return new AppError(message, 500);
  }
}

module.exports = AppError;
