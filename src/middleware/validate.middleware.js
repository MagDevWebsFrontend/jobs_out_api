const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');

/**
 * @middleware validate
 * @description Middleware para validar los resultados de express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw AppError.validationError('Error de validación', errorMessages);
  }
  
  next();
};

module.exports = {
  validate
};