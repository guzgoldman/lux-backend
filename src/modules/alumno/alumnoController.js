const {
  Usuario,
  Persona,
  InscripcionMateria,
  MateriaPlanCicloLectivo,
  Materia,
  AlumnoCarrera,
  Carrera,
  ProfesorMateria,
  MateriaPlan,
  Correlativa,
  InscripcionExamenFinal,
  ExamenFinal,
  PlanEstudio,
  CalificacionCuatrimestre,
} = require("../../models");
const { Op } = require("sequelize");

// Obtener las carreras en las que se inscribió el alumno
exports.getCarrerasInscripto = async (req, res) => {
  try {
    const idAlumnoBuscado = req.user.id;
    const alumno = await Usuario.findByPk(idAlumnoBuscado, {
      attributes: ["id_persona"],
    });

    const idAlumno = alumno?.id_persona;
    const inscripciones = await AlumnoCarrera.findAll({
      where: { id_persona: idAlumno },
      include: [
        {
          model: Carrera,
          as: "carrera",
          attributes: ["id", "nombre"],
        },
      ],
    });

    // Extraer las carreras de las inscripciones
    const carreras = inscripciones.map((inscripcion) => inscripcion.carrera);

    if (!carreras.length) {
      return res.status(404).json({
        message: "El alumno no está inscripto en ninguna carrera.",
      });
    }

    res.status(200).json(carreras);
  } catch (error) {
    console.error("Error al obtener las carreras del alumno: ", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener las materias de un alumno para una carrera específica
exports.getMateriasPorCarrera = async (req, res) => {
  try {
    const { idCarrera } = req.params;
    const idAlumnoBuscado = req.user.id;

    // Obtener id_persona del usuario
    const alumno = await Usuario.findByPk(idAlumnoBuscado, {
      attributes: ["id_persona"],
    });
    const idAlumno = alumno?.id_persona;
    if (!idAlumno) {
      return res.status(404).json({ message: "Alumno no encontrado." });
    }

    // Verificar inscripción del alumno en la carrera
    const inscripcion = await AlumnoCarrera.findOne({
      where: {
        id_persona: idAlumno,
        id_carrera: idCarrera,
      },
    });
    if (!inscripcion) {
      return res.status(404).json({
        message: "El alumno no está inscripto en esta carrera.",
      });
    }

    // Traer todas las materias inscriptas o aprobadas del alumno para esa carrera
    const materiasInscriptas = await InscripcionMateria.findAll({
      where: {
        id_usuario_alumno: idAlumnoBuscado,
        estado: { [Op.in]: ["INSCRIPTO", "APROBADO"] },
      },
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          required: true,
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              required: true,
              include: [
                {
                  model: Materia,
                  as: "materia",
                  attributes: ["id", "nombre"],
                  required: true,
                },
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
                      attributes: ["nombre", "apellido"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Filtrar solo las materias que pertenecen a la carrera consultada
    const materiasFiltradas = materiasInscriptas.filter(
      (item) => item.ciclo?.materiaPlan?.id_plan_estudio // id_plan_estudio debe estar en MateriaPlan
    );

    // Mapear la respuesta
    const resumenMateriasAlumno = materiasFiltradas.map((item) => ({
      id: item.ciclo?.materiaPlan?.materia?.id ?? null,
      nombre: item.ciclo?.materiaPlan?.materia?.nombre ?? "",
      estado: item.estado,
      nota: item.nota_final,
      anio: item.ciclo?.anio ?? null,
      profesor: item.ciclo?.profesores?.length
        ? item.ciclo.profesores
            .map(
              (p) =>
                `${p.profesor?.persona?.nombre ?? ""} ${
                  p.profesor?.persona?.apellido ?? ""
                }`
            )
            .join(", ")
        : "Sin profesor asignado",
    }));

    return res.status(200).json(resumenMateriasAlumno);
  } catch (error) {
    console.error("Error al obtener las materias del alumno: ", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor.", error: error.message });
  }
};

exports.registrarInscripcionMateria = async (req, res) => {
  const idAlumno = req.user.id;
  const { idTipoAlumno } = req.body;
  const { idMateriaPlanCicloLectivo } = req.params;

  try {
    await InscripcionMateria.create({
      id_usuario_alumno: idAlumno,
      id_materia_plan_ciclo_lectivo: idMateriaPlanCicloLectivo,
      creado_por: idAlumno,
      id_tipo_alumno: idTipoAlumno,
    });
    return res
      .status(201)
      .json({ message: "Inscripción registrada con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al registrar la inscripción" });
  }
};

exports.verificarEstadoInscripcionMaterias = async (req, res) => {
  const idAlumno = req.user.id;
  const { planId } = req.params;
  const currentYear = new Date().getFullYear();

  try {
    // 1. Obtener todas las materias del plan del ciclo lectivo actual, incluyendo el nombre de la materia
    const materiasPlan = await MateriaPlan.findAll({
      where: { id_plan_estudio: planId },
      attributes: ["id"],
      include: [
        {
          model: Materia,
          as: "materia",
          attributes: ["id", "nombre"],
        },
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclos",
          where: { ciclo_lectivo: currentYear },
          attributes: ["id"],
          required: true,
        },
      ],
    });

    const idsMateriaPlan = materiasPlan.map((mp) => mp.id);

    // 2. Obtener inscripciones existentes del alumno para este ciclo lectivo (Estados relevantes)
    const inscripcionesExistentes = await InscripcionMateria.findAll({
      where: {
        id_usuario_alumno: idAlumno,
        // de momento mantenemos la misma lógica; si querés usar Op.in podés agregarlo
        estado: ["Inscripto", "Cursando", "Aprobado"],
      },
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          where: { ciclo_lectivo: currentYear },
          required: true,
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              where: { id_plan_estudio: planId },
              required: false,
            },
          ],
        },
      ],
    });

    // 3. Obtener materias aprobadas históricamente del alumno (por plan)
    const materiasAprobadas = await InscripcionMateria.findAll({
      where: {
        id_usuario_alumno: idAlumno,
        estado: "Aprobado",
      },
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          required: false,
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              where: { id_plan_estudio: planId },
              required: false,
            },
          ],
        },
      ],
    });

    // 4. Obtener todas las correlativas del plan con información de las materias correlativas
    //    Aseguramos que si idsMateriaPlan está vacío, no hagamos una consulta inútil.
    let correlativas = [];
    if (idsMateriaPlan.length > 0) {
      correlativas = await Correlativa.findAll({
        where: { id_materia_plan: idsMateriaPlan },
        include: [
          {
            model: MateriaPlan,
            as: "materiaCorrelativa",
            include: [
              {
                model: Materia,
                as: "materia",
                attributes: ["id", "nombre"],
              },
            ],
          },
        ],
      });
    }

    // 5. Crear mapas para facilitar las verificaciones (con protecciones)
    const materiasInscriptasMap = new Set(
      inscripcionesExistentes
        .map((ins) =>
          ins.ciclo && ins.ciclo.materiaPlan ? ins.ciclo.materiaPlan.id : null
        )
        .filter(Boolean)
    );

    const materiasAprobadasMap = new Set(
      materiasAprobadas
        .map((ins) =>
          ins.ciclo && ins.ciclo.materiaPlan ? ins.ciclo.materiaPlan.id : null
        )
        .filter(Boolean)
    );

    const correlativasMap = new Map();
    correlativas.forEach((corr) => {
      const key = corr.id_materia_plan;
      if (!correlativasMap.has(key)) correlativasMap.set(key, []);
      const correlativaId = corr.id_materia_plan_correlativa;
      const correlativaNombre =
        corr.materiaCorrelativa?.materia?.nombre || null;
      correlativasMap.get(key).push({
        id: correlativaId,
        nombre: correlativaNombre,
      });
    });

    // 6. Verificar estado de cada materia (añadimos nombre de la materia principal)
    const estadoMaterias = materiasPlan.map((materiaPlan) => {
      const idMateriaPlan = materiaPlan.id;
      const idMateriaPlanCicloLectivo =
        materiaPlan.ciclos && materiaPlan.ciclos[0]
          ? materiaPlan.ciclos[0].id
          : null;

      // Nombre de la materia (si fue incluido)
      const nombreMateria = materiaPlan.materia?.nombre || null;

      // Verificar si ya está inscripto
      const yaInscripto = materiasInscriptasMap.has(idMateriaPlan);

      // Verificar si ya está aprobado
      const yaAprobado = materiasAprobadasMap.has(idMateriaPlan);

      // Verificar correlativas (traemos objetos {id, nombre})
      const correlativasRequeridas = correlativasMap.get(idMateriaPlan) || [];
      const correlativasPendientes = correlativasRequeridas.filter(
        (corr) => !materiasAprobadasMap.has(corr.id)
      );
      const correlativasCumplidas = correlativasPendientes.length === 0;

      // Determinar si puede inscribirse
      let puedeInscribirse = true;
      let razonBloqueo = null;

      if (yaAprobado) {
        puedeInscribirse = false;
        razonBloqueo = "Materia ya aprobada";
      } else if (yaInscripto) {
        puedeInscribirse = false;
        razonBloqueo = "Ya inscripto en esta materia";
      } else if (!correlativasCumplidas) {
        puedeInscribirse = false;
        razonBloqueo = "Correlativas no cumplidas";
      }

      return {
        idMateriaPlan,
        idMateriaPlanCicloLectivo,
        nombreMateria, // <-- nombre agregado
        puedeInscribirse,
        razonBloqueo,
        yaInscripto,
        yaAprobado,
        // devolvemos correlativas como objetos con id + nombre para más flexibilidad en frontend
        correlativasRequeridas: correlativasRequeridas.map((c) => ({
          id: c.id,
          nombre: c.nombre,
        })),
        correlativasPendientes: correlativasPendientes.map((c) => ({
          id: c.id,
          nombre: c.nombre,
        })),
        correlativasCumplidas,
      };
    });

    // 7. Ordenar materias: primero las que se puede inscribir, luego las que no (prioridad definida)
    estadoMaterias.sort((a, b) => {
      if (a.puedeInscribirse !== b.puedeInscribirse) {
        // queremos true (1) primero => hacer b - a
        return (
          (b.puedeInscribirse === true ? 1 : 0) -
          (a.puedeInscribirse === true ? 1 : 0)
        );
      }
      const ordenPrioridad = {
        null: 0,
        "Ya inscripto en esta materia": 1,
        "Materia ya aprobada": 2,
        "Correlativas no cumplidas": 3,
      };
      return (
        (ordenPrioridad[a.razonBloqueo] || 4) -
        (ordenPrioridad[b.razonBloqueo] || 4)
      );
    });

    // Respuesta
    res.json({
      success: true,
      data: estadoMaterias,
      resumen: {
        totalMaterias: materiasPlan.length,
        disponiblesParaInscripcion: estadoMaterias.filter(
          (m) => m.puedeInscribirse
        ).length,
        yaInscriptas: estadoMaterias.filter((m) => m.yaInscripto).length,
        yaAprobadas: estadoMaterias.filter((m) => m.yaAprobado).length,
        bloqueadasPorCorrelativas: estadoMaterias.filter(
          (m) => m.razonBloqueo === "Correlativas no cumplidas"
        ).length,
      },
    });
  } catch (error) {
    console.error("Error en verificarEstadoInscripcionMaterias:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar estado de inscripciones",
      error: error.message,
    });
  }
};

exports.listarExamenesPorPlan = async (req, res) => {
  const { idPlan } = req.params;
  try {
    const examenes = await ExamenFinal.findAll({
      attributes: ["id", "fecha", "estado", "id_usuario_profesor"],
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          required: true,
          attributes: ["id", "id_materia"],
          include: [
            {
              model: Materia,
              as: "materia",
              required: true,
              attributes: ["id", "id_tipo_materia", "nombre"],
            },
            {
              model: PlanEstudio,
              as: "planEstudio",
              required: true,
              where: { id: idPlan },
              attributes: ["id", "resolucion"],
            },
          ],
        },
        {
          model: Usuario,
          as: "Profesor",
          attributes: ["id", "id_persona"],
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: ["nombre", "apellido"],
            },
          ],
        },
      ],
      order: [["fecha", "DESC"]],
    });
    res.json(examenes);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.verificarEstadoInscripcionFinales = async (req, res) => {
  const { idPlan } = req.params;
  const idAlumno = req.user.id;

  try {
    const examenes = await ExamenFinal.findAll({
      attributes: ["id", "fecha", "estado", "id_usuario_profesor"],
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          required: true,
          attributes: ["id", "id_materia"],
          include: [
            {
              model: Materia,
              as: "materia",
              required: true,
              attributes: ["id", "id_tipo_materia", "nombre"],
            },
            {
              model: PlanEstudio,
              as: "planEstudio",
              required: true,
              where: { id: idPlan },
              attributes: ["id", "resolucion"],
            },
          ],
        },
        {
          model: Usuario,
          as: "Profesor",
          attributes: ["id", "id_persona"],
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: ["nombre", "apellido"],
            },
          ],
        },
      ],
      order: [["fecha", "DESC"]],
    });

    if (!examenes.length) {
      return res.status(200).json({
        success: true,
        data: [],
        resumen: {
          totalFinales: 0,
          disponiblesParaInscripcion: 0,
          yaInscriptoFinal: 0,
          bloqueados: 0,
        },
      });
    }

    const examenesIds = Array.from(new Set(examenes.map((examen) => examen.id)));
    const materiaPlanIds = Array.from(
      new Set(
        examenes
          .map((examen) => examen.materiaPlan?.id)
          .filter((idMateriaPlan) => idMateriaPlan != null)
      )
    );

    const inscripcionesFinales =
      examenesIds.length > 0
        ? await InscripcionExamenFinal.findAll({
            where: {
              id_usuario_alumno: idAlumno,
              id_examen_final: { [Op.in]: examenesIds },
            },
          })
        : [];

    const inscripcionFinalSet = new Set(
      inscripcionesFinales.map((inscripcion) => inscripcion.id_examen_final)
    );

    const inscripcionesMateria =
      materiaPlanIds.length > 0
        ? await InscripcionMateria.findAll({
            where: { id_usuario_alumno: idAlumno },
            attributes: [
              "id",
              "estado",
              "nota_final",
              "id_tipo_alumno",
              "fecha_inscripcion",
            ],
            include: [
              {
                model: MateriaPlanCicloLectivo,
                as: "ciclo",
                where: { id_materia_plan: { [Op.in]: materiaPlanIds } },
                required: true,
                attributes: ["id", "id_materia_plan", "tipo_aprobacion"],
              },
              {
                model: CalificacionCuatrimestre,
                as: "calificaciones",
                required: false,
                attributes: ["calificacion"],
              },
            ],
            order: [
              ["fecha_inscripcion", "DESC"],
              ["id", "DESC"],
            ],
          })
        : [];

    const inscripcionMateriaMap = new Map();
    inscripcionesMateria.forEach((inscripcion) => {
      const idMateriaPlan = inscripcion?.ciclo?.id_materia_plan;
      if (!idMateriaPlan) return;
      if (!inscripcionMateriaMap.has(idMateriaPlan)) {
        inscripcionMateriaMap.set(idMateriaPlan, inscripcion);
      }
    });

    const estadosFinales = examenes.map((examen) => {
      const idExamenFinal = examen.id;
      const idMateriaPlan = examen.materiaPlan?.id ?? null;
      const inscripcionMateria =
        idMateriaPlan != null
          ? inscripcionMateriaMap.get(idMateriaPlan)
          : null;

      let puedeInscribirse = true;
      let razonBloqueo = null;
      let tipoAprobacion = null;
      let promedioCalificaciones = null;
      let notaBase = null;
      let tipoAlumno = null;
      const yaInscriptoFinal = inscripcionFinalSet.has(idExamenFinal);

      if (yaInscriptoFinal) {
        puedeInscribirse = false;
        razonBloqueo = "Ya estás inscripto/a a este examen final.";
      } else if (!inscripcionMateria) {
        puedeInscribirse = false;
        razonBloqueo =
          "No registrás inscripciones a esta materia.";
      } else {
        const estadoInscripcion = (
          inscripcionMateria.estado || ""
        ).toLowerCase();
        tipoAlumno =
          inscripcionMateria.id_tipo_alumno != null
            ? Number(inscripcionMateria.id_tipo_alumno)
            : null;

        if (estadoInscripcion !== "regularizada") {
          puedeInscribirse = false;
          razonBloqueo =
            "La cursada aún no está regularizada.";
        } else if (tipoAlumno === 3) {
          puedeInscribirse = false;
          razonBloqueo =
            "Los alumnos oyentes no pueden inscribirse a exámenes finales.";
        } else {
          tipoAprobacion = inscripcionMateria.ciclo?.tipo_aprobacion || null;

          if (!tipoAprobacion) {
            puedeInscribirse = false;
            razonBloqueo =
              "No se pudo determinar el tipo de aprobación de la materia para validar la inscripción.";
          } else {
            const calificaciones = (inscripcionMateria.calificaciones || [])
              .map((calificacion) =>
                calificacion?.calificacion != null
                  ? Number(calificacion.calificacion)
                  : null
              )
              .filter((calificacion) => calificacion != null);

            if (calificaciones.length > 0) {
              promedioCalificaciones =
                calificaciones.reduce((acc, nota) => acc + nota, 0) /
                calificaciones.length;
            }

            if (tipoAprobacion === "EP") {
              if (promedioCalificaciones == null) {
                puedeInscribirse = false;
                razonBloqueo =
                  "La materia es exclusivamente promocionable y no registra calificaciones de cuatrimestre.";
              } else if (promedioCalificaciones < 7) {
                puedeInscribirse = false;
                razonBloqueo =
                  "Para materias exclusivamente promocionables el promedio de calificaciones debe ser al menos 7.";
              }
            } else {
              notaBase =
                inscripcionMateria.nota_final != null
                  ? Number(inscripcionMateria.nota_final)
                  : promedioCalificaciones;

              if (notaBase == null) {
                puedeInscribirse = false;
                razonBloqueo =
                  "La materia no registra calificaciones suficientes para validar la inscripción al examen final.";
              } else if (notaBase < 4) {
                puedeInscribirse = false;
                razonBloqueo =
                  "La calificación obtenida en la cursada debe ser igual o superior a 4 para rendir el examen final.";
              }
            }
          }
        }
      }

      return {
        idExamenFinal,
        idMateriaPlan,
        fecha: examen.fecha,
        estadoExamen: examen.estado,
        materia: {
          id: examen.materiaPlan?.materia?.id ?? null,
          nombre: examen.materiaPlan?.materia?.nombre ?? null,
        },
        profesor: examen.Profesor
          ? {
              id: examen.Profesor.id,
              nombre: examen.Profesor.persona?.nombre ?? null,
              apellido: examen.Profesor.persona?.apellido ?? null,
            }
          : null,
        puedeInscribirse,
        razonBloqueo,
        tipoAprobacion,
        promedioCalificaciones,
        notaBase,
        tipoAlumno,
        yaInscriptoFinal,
      };
    });

    const resumen = {
      totalFinales: estadosFinales.length,
      disponiblesParaInscripcion: estadosFinales.filter(
        (estado) => estado.puedeInscribirse
      ).length,
      yaInscriptoFinal: estadosFinales.filter(
        (estado) => estado.yaInscriptoFinal
      ).length,
      bloqueados: estadosFinales.filter(
        (estado) => !estado.puedeInscribirse
      ).length,
    };

    res.status(200).json({
      success: true,
      data: estadosFinales,
      resumen,
    });
  } catch (error) {
    console.error(
      "Error al verificar estado de inscripción a exámenes finales:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Error al verificar estado de inscripción a exámenes finales",
      error: error.message,
    });
  }
};
