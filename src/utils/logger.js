 const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error ? error.stack : '');
  },
  warn: (message, data = null) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  }
};

module.exports = logger;
