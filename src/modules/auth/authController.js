const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
require('dotenv').config();
const DAY_MS = 24 * 60 * 60 * 1000;

const { Usuario } = require('../../models');

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const roles = await usuario.getRols({
      attributes: ['nombre'],
      joinTableAttributes: []
    });
    const roleNames = roles.map(r => r.nombre);

    const token1 = jwt.sign(
      { id: usuario.id, username: usuario.username, roles: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('access_token', token1, {
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'strict',
      maxAge   : 15 * 60 * 1000         // 15 min
    });

    res.json({ roles: roleNames });
  } catch (err) {
    next(err);
  }
};

exports.seleccionarRol = (req, res) => {
  const token1 = req.cookies?.access_token || '';
  if (!token1) return res.status(401).json({ message: 'No token' });

  jwt.verify(token1, process.env.JWT_SECRET, (err, payload1) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });

    const { rol } = req.body;
    if (!rol || !payload1.roles.includes(rol)) {
      return res.status(403).json({ message: 'Rol no permitido' });
    }

    const token2 = jwt.sign(
      { id: payload1.id, username: payload1.username, rol: rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('access_token', token2, {
      httpOnly : true,
      secure   : process.env.NODE_ENV === 'production',
      sameSite : 'strict',
      maxAge   : 8 * 60 * 60 * 1000
    });

    res.json({ ok: true });
  });
};

exports.logout = (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.sendStatus(204);
};

exports.me = (req, res) => res.json(req.user);