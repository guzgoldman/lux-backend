/**
 *  Auth – Controller
 *  Endpoints:
 *    POST /api/auth/login
 *    POST /api/auth/select-role
 */
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
require('dotenv').config();
const DAY_MS = 24 * 60 * 60 * 1000;

const { Usuario, Rol, RolUsuario } = require('../../models');

/**
 * POST /api/auth/login
 * • Verifica credenciales.
 * • Devuelve TOKEN1 (válido 15 min) + lista de roles del usuario.
 */
exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // 1) Buscar usuario
    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2) Comparar password
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3) Traer roles del usuario — ahora es una sola línea
    const roles = await usuario.getRols({
      attributes: ['nombre'],
      joinTableAttributes: []        // no necesitamos columnas de rol_usuario
    });
    const roleNames = roles.map(r => r.nombre);

    // 4) Firmar TOKEN1 (pre-rol)
    const token1 = jwt.sign(
      { id: usuario.id, username: usuario.username, roles: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    /* ▸  Enviamos TOKEN1 en una cookie httpOnly  */
    res.cookie('access_token', token1, {
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'strict',
      maxAge   : 15 * 60 * 1000         // 15 min
    });

    /* ▸  Al front solo le mandamos la lista de roles */
    res.json({ roles: roleNames });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/select-role
 * • Recibe TOKEN1 (en header Bearer) + rol elegido.
 * • Verifica que dicho rol pertenece al usuario.
 * • Devuelve TOKEN2 (8 h) con 1 solo rol en el payload.
 *   { token: '<JWT DEFINITIVO>' }
 */
exports.selectRole = (req, res) => {
  /* ▸  Ahora el TOKEN1 viene en la cookie */
  const token1 = req.cookies?.access_token || '';
  if (!token1) return res.status(401).json({ message: 'No token' });

  jwt.verify(token1, process.env.JWT_SECRET, (err, payload1) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });

    const { role } = req.body;            // { "role": "Alumno" }
    if (!role || !payload1.roles.includes(role)) {
      return res.status(403).json({ message: 'Rol no permitido' });
    }

    const token2 = jwt.sign(
      { id: payload1.id, username: payload1.username, roles: [role] },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    /* ▸  Sobrescribimos cookie con TOKEN 2 (rol único)  */
    res.cookie('access_token', token2, {
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'strict',
      maxAge   : 8 * 60 * 60 * 1000      // 8 h
    });

    res.json({ ok: true });
  });
};

exports.me = (req, res) => res.json(req.user);

/**
 * POST /api/auth/logout
 * Borra la cookie httpOnly del JWT y responde 204.
 */
exports.logout = (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.sendStatus(204);  // No Content
};
