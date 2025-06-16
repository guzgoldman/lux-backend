module.exports = (err, req, res, next) => {
  console.error(err);

  const status = err.statusCode || err.status || 500;

  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }
  });
};
