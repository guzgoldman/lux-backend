// src/middlewares/errorHandler.js

module.exports = (err, req, res, next) => {
  // 1) Log para desarrollo
  console.error(err);

  // 2) Determinar código HTTP
  const status = err.statusCode || err.status || 500;

  // 3) Mensaje de respuesta
  const message = err.message || 'Internal Server Error';

  // 4) Enviar JSON de error
  res.status(status).json({
    error: {
      status,
      message,
      // opcional: stack en dev
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }
  });
};
