// /modules/auth/auth.js (o donde lo tengas)
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
  /* ▸  1) Cookie httpOnly */
  const tokenCookie = req.cookies?.access_token;
  /* ▸  2) Aún aceptamos Authorization por si haces tests con Postman */
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

    /**
     *  payload típico:
     *  { id: 9, username: 'admin', roles: ['Administrador'] }
     */
    req.user = payload;
    next();
  });
};

/**
 *  Middleware de autorización por rol.
 *  Uso: router.get('/ruta', verifyToken, requireRole('Administrador'), handler);
 */
exports.requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.roles) {
    // El token es válido pero no trae roles => 403 (forbidden)
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const tieneRol = req.user.roles.some((r) => allowedRoles.includes(r));
  if (!tieneRol) {
    return res.status(403).json({ message: 'No tenés permisos' });
  }

  next();
};
