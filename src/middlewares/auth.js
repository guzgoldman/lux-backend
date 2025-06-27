const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
  const tokenCookie = req.cookies?.access_token;
  const authHeader  = req.headers.authorization || '';
  const tokenHeader = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  const token = tokenCookie || tokenHeader;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.user = payload;
    next();
  });
};

exports.requireRole = (...allowedRoles) => (req, res, next) => {
  const usuarioRol = req.user?.rol;

  if (!usuarioRol) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  if (!allowedRoles.includes(usuarioRol)) {
    return res.status(403).json({ message: 'No tenés permisos suficientes' });
  }

  next();
};
