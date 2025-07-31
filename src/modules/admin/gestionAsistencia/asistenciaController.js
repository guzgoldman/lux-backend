const { Asistencia, Clase } = require('../../../models');

exports.registrarAsistencia = async (req, res, next) => {
  const { claseId, alumnoId, estado, profesorRegistroId } = req.body;

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const asistencia = await Asistencia.create({
      id_clase: clase.id,
      id_usuario_alumno: alumnoId,
      estado_asistencia: estado,
      id_usuario_profesor_registro: profesorRegistroId || req.user.id,
      creado_por: req.user.id
    });

    res.status(201).json(asistencia);
  } catch (err) {
    next(err);
  }
};