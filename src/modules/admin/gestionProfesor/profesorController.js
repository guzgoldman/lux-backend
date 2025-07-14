const bcrypt = require("bcrypt");
const {
  Persona,
  Usuario,
  Rol,
  RolUsuario,
  sequelize,
} = require("../../../models");

exports.listarProfesores = async (req, res, next) => {
  try {
    const profesores = await Usuario.findAll({
      include: [
        {
          model: Rol,
          where: { nombre: "Profesor" },
          attributes: [],
          through: { attributes: [] },
        },
        { model: Persona,
          attributes: ['nombre', 'apellido', 'dni']
        },
      ],
      attributes: ["id", "username"],
    });
    res.json(profesores);
  } catch (err) {
    next(err);
  }
};

exports.registrarProfesor = async (req, res, next) => {
  const { nombre, apellido, sexo, email, dni, telefono, fecha_nacimiento } =
    req.body;

  try {
    await sequelize.transaction(async (t) => {
      let persona = await Persona.findOne({ where: { dni }, transaction: t });

      if (!persona) {
        if (
          !nombre ||
          !apellido ||
          !sexo ||
          !email ||
          !telefono ||
          !fecha_nacimiento
        ) {
          throw new Error("Faltan datos para crear la persona");
        }
        persona = await Persona.create(
          {
            nombre,
            apellido,
            sexo,
            email,
            dni,
            telefono,
            fecha_nacimiento,
          },
          { transaction: t }
        );
      }

      let usuario = await Usuario.findOne({
        where: { id_persona: persona.id },
        transaction: t,
      });

      if (!usuario) {
        const existe = await Usuario.findOne({
          where: { username: dni },
          transaction: t,
        });
        if (existe)
          throw new Error("Ya existe un usuario con ese DNI como username");
        usuario = await Usuario.create(
          {
            username: dni,
            password: await bcrypt.hash(dni, 10),
            id_persona: persona.id,
          },
          { transaction: t }
        );
      }

      let rolProfesor = await Rol.findOne({
        where: { nombre: "Profesor" },
        transaction: t,
      });
      if (!rolProfesor) {
        rolProfesor = await Rol.create(
          { nombre: "Profesor" },
          { transaction: t }
        );
      }

      const yaEsProfesor = await RolUsuario.findOne({
        where: { id_usuario: usuario.id, id_rol: rolProfesor.id },
        transaction: t,
      });
      if (!yaEsProfesor) {
        await RolUsuario.create(
          { id_usuario: usuario.id, id_rol: rolProfesor.id },
          { transaction: t }
        );
      }

      res.status(201).json({
        personaId: persona.id,
        usuarioId: usuario.id,
        username: usuario.username,
      });
    });
  } catch (err) {
    next(err);
  }
};
