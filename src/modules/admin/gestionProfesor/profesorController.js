const bcrypt = require("bcrypt");
const {
  Persona,
  Usuario,
  Rol,
  RolUsuario,
  ProfesorMateria,
  MateriaPlanCicloLectivo,
  MateriaPlan,
  Materia,
  PlanEstudio,
  Carrera,
  sequelize,
} = require("../../../models");
const { Op } = require("sequelize");

exports.listarProfesores = async (req, res, next) => {
  try {
    const profesores = await Usuario.findAll({
      include: [
        {
          model: Rol,
          as: "roles",
          where: { nombre: "Profesor" },
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: Persona,
          as: "persona",
          attributes: ["nombre", "apellido", "dni", "email", "telefono"],
        },
      ],
      attributes: ["id", "username"],
    });

    // Obtener la fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split('T')[0];

    // Para cada profesor, obtener sus materias asignadas
    const profesoresConMaterias = await Promise.all(
      profesores.map(async (profesor) => {
        const materiasAsignadas = await ProfesorMateria.findAll({
          where: { id_usuario_profesor: profesor.id },
          include: [
            {
              model: MateriaPlanCicloLectivo,
              as: "ciclo",
              where: {
                // Materias activas: sin fecha de cierre O fecha actual menor a fecha_cierre
                [Op.or]: [
                  { fecha_cierre: null },
                  { fecha_cierre: '0000-00-00' },
                  { fecha_cierre: { [Op.gt]: fechaActual } }
                ]
              },
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                  include: [
                    {
                      model: Materia,
                      as: "materia",
                      attributes: ["id", "nombre"],
                    },
                    {
                      model: PlanEstudio,
                      as: "planEstudio",
                      attributes: ["id", "resolucion"],
                      include: [
                        {
                          model: Carrera,
                          as: "carrera",
                          attributes: ["id", "nombre"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });

        const materiasInfo = materiasAsignadas.map((asignacion) => {
          const fechaCierre = asignacion.ciclo?.fecha_cierre;
          let estadoMateria = 'Activa';
          
          if (fechaCierre && fechaCierre !== '0000-00-00') {
            const fechaCierreDate = new Date(fechaCierre);
            const hoy = new Date();
            estadoMateria = fechaCierreDate > hoy ? 'Activa' : 'Cerrada';
          }

          return {
            id: asignacion.ciclo?.id,
            nombre: asignacion.ciclo?.materiaPlan?.materia?.nombre,
            carrera: asignacion.ciclo?.materiaPlan?.planEstudio?.carrera?.nombre,
            resolucion: asignacion.ciclo?.materiaPlan?.planEstudio?.resolucion,
            cicloLectivo: asignacion.ciclo?.ciclo_lectivo,
            rol: asignacion.rol,
            fechaInicio: asignacion.ciclo?.fecha_inicio,
            fechaCierre: asignacion.ciclo?.fecha_cierre,
            estado: estadoMateria,
          };
        });

        return {
          ...profesor.toJSON(),
          materiasAsignadas: materiasInfo,
          totalMaterias: materiasInfo.length,
        };
      })
    );

    res.json(profesoresConMaterias);
  } catch (err) {
    next(err);
  }
};

exports.registrarProfesor = async (req, res, next) => {
  const { nombre, apellido, sexo, email, dni, telefono, nacionalidad, fecha_nacimiento } =
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
          !nacionalidad ||
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
            nacionalidad,
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