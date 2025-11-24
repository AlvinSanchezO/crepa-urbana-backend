const morgan = require('morgan');

// Configuración personalizada de logs
// Muestra: :method :url :status :response-time ms
const requestLogger = morgan(':method :url :status - :response-time ms');

module.exports = requestLogger;