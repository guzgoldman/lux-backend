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
} = require('../../models');

exports.listarPreinscripcion = async (_req, res, next) => {
  try {
    const personas = await Persona.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },

      include: [
        // 2) INNER JOIN a preinscripcion pendiente + visible
        {
          model: Preinscripcion,
          attributes: ['id', 'id_carrera', 'comentario'],
          where: { estado: 'Pendiente', visible: 1 },
          required: true 
        }
      ],
      order: [['fecha_registro', 'ASC']]
    });

    res.json(personas);
  } catch (err) {
    next(err);
  }
};

exports.aceptar = async (req, res, next) => {
  const { personaId } = req.params;
  const { tipoAlumnoId, carreraId } = req.body;

  try {
    await sequelize.transaction(async (t) => {
      const persona = await Persona.findByPk(personaId, { transaction: t });
      if (!persona) throw new Error('Persona no encontrada');

      // Buscar preinscripcion pendiente y visible
      const preinscripcion = await Preinscripcion.findOne({
        where: { id_persona: persona.id, estado: 'Pendiente', visible: 1 },
        transaction: t
      });
      if (!preinscripcion) throw new Error('No se encontró una preinscripción pendiente para esta persona.');

      // Actualizar estado y visibilidad
      preinscripcion.estado = 'Aprobada';
      preinscripcion.visible = 0;
      await preinscripcion.save({ transaction: t });

      // Buscar usuario existente para esa persona
      let usuario = await Usuario.findOne({ where: { id_persona: persona.id }, transaction: t });

      if (!usuario) {
        // Autogenerar username y password igual al dni
        const dni = persona.dni;
        // Validar que no exista otro usuario con ese username
        const existe = await Usuario.findOne({ where: { username: dni }, transaction: t });
        if (existe) throw new Error('Ya existe un usuario con ese DNI como username');

        usuario = await Usuario.create({
          username: dni,
          password: await bcrypt.hash(dni, 10),
          id_persona: persona.id
        }, { transaction: t });
      }

      // Rol "Alumno" (si no lo tiene, asignar)
      let rolAlumno = await Rol.findOne({ where: { nombre: 'Alumno' }, transaction: t });
      if (!rolAlumno) {
        rolAlumno = await Rol.create({ nombre: 'Alumno' }, { transaction: t });
      }

      const yaEsAlumno = await RolUsuario.findOne({
        where: { id_usuario: usuario.id, id_rol: rolAlumno.id },
        transaction: t
      });
      if (!yaEsAlumno) {
        await RolUsuario.create(
          { id_usuario: usuario.id, id_rol: rolAlumno.id },
          { transaction: t }
        );
      }

      // Inscribirlo en la carrera (si ya está en esa carrera no volver a inscribirlo)
      const yaInscripto = await AlumnoCarrera.findOne({
        where: { id_persona: persona.id, id_carrera: carreraId },
        transaction: t
      });
      if (!yaInscripto) {
        await AlumnoCarrera.create(
          {
            id_persona: persona.id,
            id_carrera: carreraId,
            id_tipo_alumno: tipoAlumnoId
          },
          { transaction: t }
        );
      }

      res.status(201).json({ usuarioId: usuario.id, username: usuario.username });
    });
  } catch (err) {
    next(err);
  }
};

exports.ocultar = async (req, res, next) => {
  const { personaId } = req.params;

  try {
    await sequelize.transaction(async (t) => {
      const persona = await Persona.findByPk(personaId, { transaction: t });
      if (!persona) throw new Error('Persona no encontrada');

      await Preinscripcion.update(
        { estado: 'Oculta', visible: 0 },
        { where: { id_persona: persona.id }, transaction: t }
      );

      res.status(204).send();
    });
  } catch (err) {
    next(err);
  }
};