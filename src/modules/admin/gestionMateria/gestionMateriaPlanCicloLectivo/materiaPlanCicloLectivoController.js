const {
  Materia,
  MateriaPlan,
  PlanEstudio,
  MateriaPlanCicloLectivo,
  InscripcionMateria,
  Usuario,
  Persona,
  Evaluacion,
  EvaluacionTipo,
  ProfesorMateria,
  Carrera,
  Clase,
  HorarioMateria,
  Tema,
  ClaseTema,
  ClaseProfesor
} = require("../../../../models");

exports.registrarMateriaPlanCicloLectivo = async (req, res, next) => {
  const {
    idMateriaPlan,
    cicloLectivo,
    fechaInicio,
    fechaCierre,
    tipoAprobacion,
  } = req.body;

  try {
    const materiaPlan = await MateriaPlan.findByPk(idMateriaPlan);
    if (!materiaPlan) {
      return res.status(404).json({ error: "Materia del plan no encontrada" });
    }

    const nuevaMateriaPlanCicloLectivo = await MateriaPlanCicloLectivo.create({
      id_materia_plan: materiaPlan.id,
      ciclo_lectivo: cicloLectivo,
      fecha_inicio: fechaInicio,
      fecha_cierre: fechaCierre,
      tipo_aprobacion: tipoAprobacion,
    });

    res.status(201).json(nuevaMateriaPlanCicloLectivo);
  } catch (err) {
    next(err);
  }
};

exports.listarMateriasPlanCicloLectivo = async (req, res, next) => {
  try {
    const materiasPlanCicloLectivo = await MateriaPlanCicloLectivo.findAll({
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          include: [
            {
              model: PlanEstudio,
              as: "planEstudio",
              include: [{ model: Carrera, as: "carrera" }],
            },
            { model: Materia, as: "materia" },
          ],
        },
        {
          model: ProfesorMateria,
          as: "profesores",
          include: [
            {
              model: Usuario,
              as: "profesor",
              include: [
                {
                  model: Persona,
                  as: "persona",
                },
              ],
            },
          ],
        },
      ],
    });
    res.status(200).json(materiasPlanCicloLectivo);
  } catch (err) {
    next(err);
  }
};

exports.modificarMateriaPlanCicloLectivo = async (req, res, next) => {
  const {
    materiaPlanCicloLectivoId,
    cicloLectivo,
    fechaInicio,
    fechaCierre,
    tipoAprobacion,
  } = req.body;

  try {
    const materiaPlanCicloLectivo = await MateriaPlanCicloLectivo.findByPk(
      materiaPlanCicloLectivoId
    );
    if (!materiaPlanCicloLectivo) {
      return res
        .status(404)
        .json({ error: "Materia del plan ciclo lectivo no encontrada" });
    }

    materiaPlanCicloLectivo.ciclo_lectivo =
      cicloLectivo || materiaPlanCicloLectivo.ciclo_lectivo;
    materiaPlanCicloLectivo.fecha_inicio =
      fechaInicio || materiaPlanCicloLectivo.fecha_inicio;
    materiaPlanCicloLectivo.fecha_cierre =
      fechaCierre || materiaPlanCicloLectivo.fecha_cierre;
    materiaPlanCicloLectivo.tipo_aprobacion =
      tipoAprobacion || materiaPlanCicloLectivo.tipo_aprobacion;
    await materiaPlanCicloLectivo.save();

    res.status(200).json(materiaPlanCicloLectivo);
  } catch (err) {
    next(err);
  }
};

exports.detalleMateriaPlanCicloLectivo = async (req, res, next) => {
  const { id } = req.params;
  try {
    const ciclo = await MateriaPlanCicloLectivo.findByPk(id, {
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          include: [
            { model: Materia, as: "materia" },
            {
              model: PlanEstudio,
              as: "planEstudio",
              include: [{ model: Carrera, as: "carrera" }],
            },
          ],
        },
        {
          model: InscripcionMateria,
          as: "inscripcionesCiclo",
          include: [
            {
              model: Usuario,
              as: "usuario",
              include: [{ model: Persona, as: "persona" }],
            },
            {
              model: Evaluacion,
              as: "evaluaciones",
              include: [{ model: EvaluacionTipo, as: "tipo" }],
            },
          ],
        },
      ],
    });

    if (!ciclo) {
      return res
        .status(404)
        .json({ error: "Materia del plan ciclo lectivo no encontrada" });
    }

    const profesores = await ProfesorMateria.findAll({
      where: { id_materia_plan_ciclo_lectivo: id },
      include: [
        {
          model: Usuario,
          as: "profesor",
          include: [{ model: Persona, as: "persona" }],
        },
      ],
    });

    const detalle = {
      id_mpcl: ciclo.id,
      ciclo: ciclo.ciclo_lectivo,
      materia: ciclo.materiaPlan?.materia?.nombre,
      resolucion: ciclo.materiaPlan?.planEstudio?.resolucion,
      carrera: ciclo.materiaPlan?.planEstudio?.carrera?.nombre,
      alumnos: (ciclo.inscripcionesCiclo || []).map((ins) => ({
        id_usuario: ins.usuario?.id,
        nombre: ins.usuario?.persona?.nombre,
        apellido: ins.usuario?.persona?.apellido,
        email: ins.usuario?.persona?.email,
        fecha_inscripcion: ins.fecha_inscripcion,
        evaluaciones: (ins.evaluaciones || []).map((ev) => ({
          tipo: ev.tipo?.descripcion,
          codigo_tipo: ev.tipo?.codigo,
          nota: ev.nota,
        })),
      })),
      profesores: profesores.map((p) => ({
        nombre: p.profesor?.persona?.nombre,
        apellido: p.profesor?.persona?.apellido,
        email: p.profesor?.persona?.email,
        rol: p.rol,
      })),
    };

    res.json(detalle);
  } catch (err) {
    next(err);
  }
};

exports.asignarProfesor = async (req, res, next) => {
  const { materiaId } = req.params;
  const { profesorId, profesorRol } = req.body;

  try {
    const materia = await MateriaPlanCicloLectivo.findByPk(materiaId);
    if (!materia) {
      return res
        .status(404)
        .json({ error: "Materia del plan ciclo lectivo no encontrada" });
    }

    const profesor = await Usuario.findByPk(profesorId);
    if (!profesor) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    await ProfesorMateria.create({
      id_materia_plan_ciclo_lectivo: materiaId,
      id_usuario_profesor: profesorId,
      rol: profesorRol,
    });

    res.status(201).json({ message: "Profesor asignado a la materia" });
  } catch (err) {
    next(err);
  }
};

exports.crearClase = async (req, res, next) => {
  const { idMateriaPlanCicloLectivo, fecha } = req.body;

  try {
    const materia = await MateriaPlanCicloLectivo.findByPk(idMateriaPlanCicloLectivo);
    if (!materia) {
      return res.status(404).json({ error: "Materia del plan ciclo lectivo no encontrada" });
    }

    const clase = await Clase.create({
      id_materia_plan_ciclo_lectivo: idMateriaPlanCicloLectivo,
      fecha
    });

    res.status(201).json(clase);
  } catch (err) {
    next(err);
  }
};

exports.listarClasesPorMateria = async (req, res, next) => {
  const { materiaId } = req.params;

  try {
    const clases = await Clase.findAll({
      where: { id_materia_plan_ciclo_lectivo: materiaId },
    });

    res.json(clases);
  } catch (err) {
    next(err);
  }
};

exports.asignarHorarioMateria = async (req, res, next) => {
  const { idMateriaPlanCicloLectivo, diaSemana, bloque } = req.body;

  try {
    const materia = await MateriaPlanCicloLectivo.findByPk(idMateriaPlanCicloLectivo);
    if (!materia) {
      return res.status(404).json({ error: "Materia del plan ciclo lectivo no encontrada" });
    }

    const horarioExistente = await HorarioMateria.findOne({
      where: {
        id_materia_plan_ciclo_lectivo: idMateriaPlanCicloLectivo,
        dia_semana: diaSemana,
        bloque: bloque
      }
    });

    if (horarioExistente) {
      return res.status(400).json({ error: "Ya existe un horario asignado para este día y bloque" });
    }

    const horario = await HorarioMateria.create({
      id_materia_plan_ciclo_lectivo: idMateriaPlanCicloLectivo,
      dia_semana: diaSemana,
      bloque: bloque
    });

    res.status(201).json(horario);
  } catch (err) {
    next(err);
  }
};

exports.registrarClaseInformacion = async (req, res, next) => {
  const { idClase, tema, idProfesor } = req.body;

  const t = await sequelize.transaction();
  try {
    const clase = await Clase.findByPk(idClase, { transaction: t });
    if (!clase) {
      await t.rollback();
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    const nuevoTema = await Tema.create(
      { descripcion: tema },
      { transaction: t }
    );

    await ClaseTema.create(
      {
        id_clase: idClase,
        id_tema: nuevoTema.id,
      },
      { transaction: t }
    );

    if (idProfesor) {
      await ClaseProfesor.create(
        {
          id_clase: idClase,
          id_usuario_profesor: idProfesor,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json('Tema y profesor vinculados correctamente');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
