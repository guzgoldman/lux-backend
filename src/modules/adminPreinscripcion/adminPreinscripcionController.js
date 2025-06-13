/**
 *  Admin » Preinscripción  – Controller
 */
const bcrypt = require('bcrypt');
const {
  Persona,
  Usuario,
  Rol,
  RolUsuario,
  AlumnoCarrera,
  Preinscripcion,
  sequelize
} = require('../../models');          // <-- ajustá si tu carpeta de models está en otro lado

/**
 * GET /api/admin/preinscripcion
 * Devuelve personas que NO tienen usuario asociado.
 */
exports.listarPendientes = async (_req, res, next) => {
  try {
    const personas = await Persona.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },

      include: [
        // 1) LEFT JOIN a usuario para poder filtrar los que ya tienen cuenta
        {
          model: Usuario,
          attributes: ['id'],
          required: false          // LEFT JOIN
        },

        // 2) INNER JOIN a preinscripcion pendiente + visible
        {
          model: Preinscripcion,
          attributes: ['id', 'comentario'],
          where: { estado: 'PENDIENTE', visible: 1 },
          required: true           // INNER JOIN: solo las que cumplen el where
        }
      ],

      // ⇣  solo personas sin usuario creado
      where: { '$usuario.id$': null },

      order: [['fecha_registro', 'ASC']]
    });

    res.json(personas);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/preinscripcion/:personaId/aceptar
 * Crea usuario, rol y activa inscripción a una carrera.
 */
exports.aceptar = async (req, res, next) => {
  const { personaId } = req.params;
  const { username, password, tipoAlumnoId, carreraId } = req.body;

  try {
    await sequelize.transaction(async (t) => {
      // 1) Validaciones básicas
      const persona = await Persona.findByPk(personaId, { transaction: t });
      if (!persona) throw new Error('Persona no encontrada');

      const existe = await Usuario.findOne({ where: { username } });
      if (existe) throw new Error('El nombre de usuario ya existe');

      // 2) Alta en usuario
      const hash = await bcrypt.hash(password, 10);

      const usuario = await Usuario.create(
        {
          username,
          password: hash,
          id_persona: persona.id
        },
        { transaction: t }
      );

      // 3) Rol “Alumno”
      let rolAlumno = await Rol.findOne({ where: { nombre: 'Alumno' }, transaction: t });
      if (!rolAlumno) {
        // semilla de respaldo si todavía no existe
        rolAlumno = await Rol.create({ nombre: 'Alumno' }, { transaction: t });
      }

      await RolUsuario.create(
        { id_usuario: usuario.id, id_rol: rolAlumno.id },
        { transaction: t }
      );

      await AlumnoCarrera.create(
        {
          id_persona: persona.id,
          id_carrera: carreraId,
          id_tipo_alumno: tipoAlumnoId
        }, {
          transaction: t
        }
      )

      // // 4) Activar inscripción en la carrera
      // const [insc] = await AlumnoCarrera.findOrCreate({
      //   where: { id_persona: persona.id, id_carrera: carreraId },
      //   defaults: { fecha_inscripcion: new Date(), activo: 1 },
      //   transaction: t
      // });

      // if (!insc.activo) {
      //   await insc.update(
      //     { activo: 1, fecha_inscripcion: new Date() },
      //     { transaction: t }
      //   );
      // }

      res.status(201).json({ usuarioId: usuario.id });
    });
  } catch (err) {
    next(err);
  }
};
