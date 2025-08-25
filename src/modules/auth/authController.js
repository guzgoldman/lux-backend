const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { Usuario } = require("../../models");

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }

  try {
    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const roles = await usuario.getRoles({
      attributes: ["nombre"],
      joinTableAttributes: [],
    });
    const roleNames = roles.map((r) => r.nombre);

    if (!roleNames.length) {
      return res.status(403).json({ message: "Usuario sin roles asignados" });
    }

    const token1 = jwt.sign(
      { id: usuario.id, username: usuario.username, roles: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("access_token", token1, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.json({ roles: roleNames, needsRoleSelection: roleNames.length > 1 });
  } catch (err) {
    next(err);
  }
};

exports.seleccionarRol = (req, res) => {
  const token1 = req.cookies?.access_token || "";
  if (!token1) return res.status(401).json({ message: "No token" });

  jwt.verify(token1, process.env.JWT_SECRET, (err, payload1) => {
    if (err) return res.status(401).json({ message: "Token inválido" });

    if (!payload1.roles || !Array.isArray(payload1.roles)) {
      return res.status(400).json({ message: "Token sin roles válidos" });
    }

    const { rol } = req.body;
    if (!rol || !payload1.roles.includes(rol)) {
      return res.status(403).json({ message: "Rol no permitido" });
    }

    const token2 = jwt.sign(
      { id: payload1.id, username: payload1.username, rol: rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("access_token", token2, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ ok: true });
  });
};

exports.logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.sendStatus(204);
};

exports.me = (req, res) => {
  // Si el usuario no tiene rol seleccionado, no está "logueado" completamente
  if (!req.user.rol) {
    return res.status(401).json({ message: "Rol no seleccionado" });
  }
  res.json(req.user);
};
