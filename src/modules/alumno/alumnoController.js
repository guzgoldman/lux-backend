const {
  InscripcionMateria,
  MateriaPlan,
  Correlativa,
  Usuario,
  Persona,
  AlumnoCarrera,
  MateriaPlanCicloLectivo,
  Materia,
} = require("../../models");

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