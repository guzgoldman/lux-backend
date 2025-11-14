const {
  Clase,
  ClaseProfesor,
  ClaseTema,
  Asistencia,
  Usuario,
  Persona,
  Tema,
  MateriaPlanCicloLectivo,
  InscripcionMateria
} = require('../../../models');

exports.detalleClase = async (req, res, next) => {
  const { claseId } = req.params;

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    console.log('Clase encontrada:', clase.id, 'Materia:', clase.id_materia_plan_ciclo_lectivo);

    // Obtener todos los alumnos inscriptos a la materia
    const inscripciones = await InscripcionMateria.findAll({
      where: { id_materia_plan_ciclo_lectivo: clase.id_materia_plan_ciclo_lectivo },
      include: [{
        model: Usuario,
        as: 'usuario',
        include: [{ model: Persona, as: 'persona' }]
      }]
    });

    console.log('Inscripciones encontradas:', inscripciones.length);
    console.log('Datos de inscripciones:', JSON.stringify(inscripciones, null, 2));

    // Obtener las asistencias registradas para esta clase
    const asistencias = await Asistencia.findAll({
      where: { id_clase: clase.id }
    });

    console.log('Asistencias encontradas:', asistencias.length);

    // Crear un mapa de asistencias por alumno
    const asistenciasMap = {};
    asistencias.forEach(a => {
      asistenciasMap[a.id_usuario_alumno] = a.estado_asistencia;
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

    // Mapear todos los alumnos inscriptos con su estado de asistencia (si existe)
    const alumnos = inscripciones.map(inscripcion => ({
      id_usuario: inscripcion.id_usuario_alumno,
      nombre: inscripcion.usuario?.persona?.nombre,
      apellido: inscripcion.usuario?.persona?.apellido,
      asistencia: asistenciasMap[inscripcion.id_usuario_alumno] || null
    }));

    console.log('Alumnos mapeados:', alumnos.length);
    console.log('Datos de alumnos:', JSON.stringify(alumnos, null, 2));

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