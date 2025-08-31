const {
  Clase,
  ClaseProfesor,
  ClaseTema,
  Asistencia,
  Usuario,
  Persona,
  Tema,
  MateriaPlanCicloLectivo
} = require('../../../models');

exports.detalleClase = async (req, res, next) => {
  const { claseId } = req.params;

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const asistencias = await Asistencia.findAll({
      where: { id_clase: clase.id },
      include: [{
        model: Usuario,
        as: 'Alumno',
        include: [{ model: Persona, as: 'persona' }]
      }]
    });

    const profesores = await ClaseProfesor.findAll({
      where: { id_clase: clase.id },
      include: [{
        model: Usuario,
        as: 'Profesor',
        include: [{ model: Persona, as: 'persona' }]
      }]
    });

    const temas = await ClaseTema.findAll({
      where: { id_clase: clase.id },
      include: [{ model: Tema, as: 'tema' }]
    });

    const alumnos = asistencias.map(a => ({
      id_usuario: a.id_usuario_alumno,
      nombre: a.Alumno?.persona?.nombre,
      apellido: a.Alumno?.persona?.apellido,
      asistencia: a.estado_asistencia
    }));

    const detalle = {
      id: clase.id,
      fecha: clase.fecha,
      profesores: profesores.map(p => ({
        nombre: p.Profesor?.persona?.nombre,
        apellido: p.Profesor?.persona?.apellido,
        email: p.Profesor?.persona?.email,
        rol: p.rol
      })),
      alumnos,
      temas: temas.map(t => t.Tema?.descripcion).filter(Boolean)
    };

    res.json(detalle);
  } catch (err) {
    next(err);
  }
};