const { Asistencia, Clase } = require("../../../models");

exports.registrarAsistencia = async (req, res, next) => {
  const { claseId, alumnoId, estado, profesorRegistroId } = req.body;

  try {
    const clase = await Clase.findByPk(claseId);
    if (!clase) {
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    // Buscar si ya existe asistencia para ese alumno en esa clase
    const asistenciaExistente = await Asistencia.findOne({
      where: { id_clase: claseId, id_usuario_alumno: alumnoId },
    });

    // Si ya existe y el usuario es profesor, no permitir registrar de nuevo
    if (asistenciaExistente && req.user.rol === "Profesor") {
      return res
        .status(400)
        .json({
          error:
            "La asistencia ya fue registrada. Solo un administrador puede modificarla.",
        });
    }

    // Si ya existe y es admin, actualizar
    if (asistenciaExistente && req.user.rol === "Administrador") {
      asistenciaExistente.estado_asistencia = estado;
      asistenciaExistente.modificado_por = req.user.id;
      asistenciaExistente.fecha_modificacion = new Date();
      await asistenciaExistente.save();
      return res.status(200).json(asistenciaExistente);
    }

    // Si no existe, crear
    if (!asistenciaExistente) {
      const asistencia = await Asistencia.create({
        id_clase: clase.id,
        id_usuario_alumno: alumnoId,
        estado_asistencia: estado,
        id_usuario_profesor_registro: profesorRegistroId || req.user.id,
        creado_por: req.user.id,
      });
      return res.status(201).json(asistencia);
    }
  } catch (err) {
    next(err);
  }
};
