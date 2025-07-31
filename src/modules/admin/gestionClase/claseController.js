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

exports.registrarClase = async (req, res, next) => {
  const { cicloLectivoId, fecha } = req.body;

  try {
    const ciclo = await MateriaPlanCicloLectivo.findByPk(cicloLectivoId);
    if (!ciclo) {
      return res.status(404).json({ error: 'Materia plan ciclo lectivo no encontrado' });
    }

    const clase = await Clase.create({
      id_materia_plan_ciclo_lectivo: ciclo.id,
      fecha
    });

    res.status(201).json(clase);
  } catch (err) {
    next(err);
  }
};

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
      include: [{ model: Tema }]
    });

    const alumnos = asistencias.map(a => ({
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