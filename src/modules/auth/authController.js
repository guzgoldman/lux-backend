const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
require("dotenv").config();

const { Usuario, Persona } = require("../../models");
const verificationService = require("../../services/verificationService");
const { enviarCorreo } = require("../../lib/mailer");

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

/**
 * Solicitar recuperación de contraseña
 * Envía un código al email del usuario
 */
exports.solicitarRecuperacion = async (req, res, next) => {
  try {
    const { identifier } = req.body; // username o email

    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({ 
        message: "Debe proporcionar su nombre de usuario o email" 
      });
    }

    // Buscar usuario por username o por email de su persona
    const usuario = await Usuario.findOne({
      where: { username: identifier.trim() },
      include: [{ model: Persona, as: "persona", required: true }],
    });

    let usuarioByEmail = null;
    if (!usuario) {
      // Intentar buscar por email
      const persona = await Persona.findOne({
        where: { email: identifier.trim() },
      });
      
      if (persona) {
        usuarioByEmail = await Usuario.findOne({
          where: { id_persona: persona.id },
          include: [{ model: Persona, as: "persona" }],
        });
      }
    }

    const usuarioEncontrado = usuario || usuarioByEmail;

    // Por seguridad, siempre devolver el mismo mensaje aunque no exista
    if (!usuarioEncontrado) {
      return res.json({ 
        message: "Si el usuario existe, recibirás un código en tu email registrado",
        sent: false
      });
    }

    // Verificar si ya existe una solicitud pendiente
    const hasPending = await verificationService.hasPendingRequest(
      usuarioEncontrado.id, 
      'password_reset'
    );
    
    if (hasPending) {
      const timeRemaining = await verificationService.getTimeRemaining(
        usuarioEncontrado.id, 
        'password_reset'
      );
      return res.status(429).json({ 
        message: "Ya existe una solicitud pendiente. Espera a que expire o usa el código enviado.",
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0
      });
    }

    const expirationMinutes = 15;
    const code = await verificationService.createPasswordResetRequest(
      usuarioEncontrado.id,
      usuarioEncontrado.persona.email,
      usuarioEncontrado.username,
      `${usuarioEncontrado.persona.nombre} ${usuarioEncontrado.persona.apellido}`,
      expirationMinutes
    );

    // Leer y compilar la plantilla de email
    const templatePath = path.join(__dirname, '../../templates/recuperar_contrasena.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const html = template({
      nombre: usuarioEncontrado.persona.nombre,
      username: usuarioEncontrado.username,
      code,
      expirationMinutes
    });

    // Enviar email
    await enviarCorreo({
      to: usuarioEncontrado.persona.email,
      subject: 'Recuperación de contraseña - Sistema LUX',
      html
    });

    res.json({ 
      message: "Si el usuario existe, recibirás un código en tu email registrado",
      sent: true,
      expiresIn: expirationMinutes * 60 // segundos
    });

  } catch (error) {
    console.error('[ERROR] Error al solicitar recuperación:', error);
    next(error);
  }
};

/**
 * Verificar código y restablecer contraseña
 */
exports.restablecerContrasena = async (req, res, next) => {
  try {
    const { identifier, codigo, nuevaPassword } = req.body;

    // Validaciones
    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({ 
        message: "Debe proporcionar su nombre de usuario o email" 
      });
    }

    if (!codigo || codigo.trim() === '') {
      return res.status(400).json({ 
        message: "Debe proporcionar el código de verificación" 
      });
    }

    if (!nuevaPassword || nuevaPassword.length < 8) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 8 caracteres" 
      });
    }

    // Buscar usuario por username o email
    const usuario = await Usuario.findOne({
      where: { username: identifier.trim() },
      include: [{ model: Persona, as: "persona", required: true }],
    });

    let usuarioByEmail = null;
    if (!usuario) {
      const persona = await Persona.findOne({
        where: { email: identifier.trim() },
      });
      
      if (persona) {
        usuarioByEmail = await Usuario.findOne({
          where: { id_persona: persona.id },
          include: [{ model: Persona, as: "persona" }],
        });
      }
    }

    const usuarioEncontrado = usuario || usuarioByEmail;

    if (!usuarioEncontrado) {
      return res.status(400).json({ 
        message: "Código inválido o expirado" 
      });
    }

    // Verificar código
    const verificationData = await verificationService.verifyPasswordReset(
      usuarioEncontrado.id, 
      codigo.trim()
    );

    if (!verificationData) {
      return res.status(400).json({ 
        message: "Código inválido o expirado" 
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // Actualizar contraseña
    await usuarioEncontrado.update({
      password: hashedPassword
    });

    // Eliminar la solicitud de recuperación
    await verificationService.deletePasswordResetRequest(usuarioEncontrado.id);

    res.json({ 
      message: "Contraseña restablecida correctamente. Ya podés iniciar sesión con tu nueva contraseña."
    });

  } catch (error) {
    console.error('[ERROR] Error al restablecer contraseña:', error);
    next(error);
  }
};
