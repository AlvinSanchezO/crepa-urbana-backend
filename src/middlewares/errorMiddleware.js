const errorHandler = (err, req, res, next) => {
  console.error('❌ [Error]:', err.stack);

  // Determinar el código de estado (si el error ya tiene uno, úsalo, si no 500)
  const statusCode = err.statusCode || 500;
  
  // Mensaje amigable
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // En desarrollo mostramos el stack para debug, en producción no
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;