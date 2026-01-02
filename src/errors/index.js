// En src/errors/index.js
const AppError = require('./AppError');
const errorHandler = require('./errorHandler');

module.exports = {
  AppError,
  errorHandler
};