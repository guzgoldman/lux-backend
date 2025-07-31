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
          include: [
            { model: Materia, as: 'materia' },
            { model: PlanEstudio, as: 'planEstudio', include: [{ model: Carrera, as: 'carrera' }] }
          ]
        },
        {
          model: InscripcionMateria,
          as: 'inscripcionesCiclo',
          include: [
            { model: Usuario, as: 'usuario', include: [{ model: Persona, as: 'persona' }] },
            { model: Evaluacion, as: 'evaluaciones', include: [{ model: EvaluacionTipo }] }
          ]
        }
      ]
    });

    if (!ciclo) {
      return res.status(404).json({ error: 'Materia del plan ciclo lectivo no encontrada' });
    }

    const profesores = await ProfesorMateria.findAll({
      where: { id_materia_plan_ciclo_lectivo: id },
      include: [{ model: Usuario, as: 'usuario', include: [{ model: Persona, as: 'persona' }] }]
    });

    const detalle = {
      id: ciclo.id,
      materia: ciclo.MateriaPlan?.materia?.nombre,
      resolucion_plan: ciclo.MateriaPlan?.planEstudio?.resolucion,
      carrera: ciclo.MateriaPlan?.planEstudio?.carrera?.nombre,
      alumnos: (ciclo.inscripcionesCiclo || []).map(ins => ({
        nombre: ins.usuario?.persona?.nombre,
        apellido: ins.usuario?.persona?.apellido,
        email: ins.usuario?.persona?.email,
        fecha_inscripcion: ins.fecha_inscripcion,
        evaluaciones: (ins.evaluaciones || []).map(ev => ({
          tipo: ev.EvaluacionTipo?.descripcion,
          codigo_tipo: ev.EvaluacionTipo?.codigo,
          nota: ev.nota
        }))
      })),
      profesores: profesores.map(p => ({
        nombre: p.usuario?.persona?.nombre,
        apellido: p.usuario?.persona?.apellido,
        email: p.usuario?.persona?.email,
        rol: p.rol
      }))
    };

    res.json(detalle);
  } catch (err) {
    next(err);
  }
};