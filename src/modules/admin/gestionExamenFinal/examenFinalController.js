const {
  Materia,
  MateriaPlan,
  MateriaPlanCicloLectivo,
  InscripcionExamenFinal,
  AsistenciaExamenFinal,
  ExamenFinal,
  InscripcionMateria,
  ProfesorMateria,
  Persona,
  Usuario,
  PlanEstudio,
  Carrera,
} = require("../../../models");
const {
  parsearFechaLocal,
  compararSoloFechas,
} = require("../../../utils/dateUtils");

const registrarExamenFinal = async (req, res) => {
  try {
    const { idMateria, fecha, idProfesor } = req.body;
    const creado_por = req.user.id;

    if (!idMateria) {
      return res.status(400).json({
        success: false,
        message: "El ID de la materia es requerido",
      });
    }

    if (!idProfesor) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario profesor es requerido",
      });
    }

    const materiaPlan = await MateriaPlan.findByPk(idMateria);
    if (!materiaPlan) {
      return res.status(404).json({
        success: false,
        message: "La materia especificada no existe",
      });
    }

    const profesor = await Usuario.findByPk(idProfesor);
    if (!profesor) {
      return res.status(404).json({
        success: false,
        message: "El profesor especificado no existe",
      });
    }

    let fechaExamen = null;
    if (fecha) {
      fechaExamen = parsearFechaLocal(fecha);
      if (!fechaExamen || isNaN(fechaExamen.getTime())) {
        return res.status(400).json({
          success: false,
          message: "La fecha proporcionada no es válida",
        });
      }

      const hoy = new Date();

      if (compararSoloFechas(fechaExamen, hoy) < 0) {
        return res.status(400).json({
          success: false,
          message: "La fecha del examen no puede ser en el pasado",
        });
      }
    }

    const nuevoExamenFinal = await ExamenFinal.create({
      id_materia_plan: idMateria,
      fecha: fechaExamen,
      id_usuario_profesor: idProfesor,
      creado_por,
      estado: "Pendiente",
    });

    const examenCreado = await ExamenFinal.findByPk(nuevoExamenFinal.id, {
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          include: [
            {
              model: Materia,
              as: "materia",
            },
          ],
        },
        {
          model: Usuario,
          as: "Profesor",
          include: [
            {
              model: Persona,
              as: "persona",
            },
          ],
        },
        {
          model: Usuario,
          as: "usuarioCreador",
          include: [
            {
              model: Persona,
              as: "persona",
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Examen final registrado exitosamente",
      data: examenCreado,
    });
  } catch (error) {
    console.error("Error al registrar examen final:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const listarExamenesFinales = async (req, res) => {
  try {
    const rolUsuario = req.user.rol;
    let whereCondition = {};

    // Si el usuario es profesor, filtrar solo los exámenes asignados a él
    if (rolUsuario === "Profesor") {
      whereCondition = { id_usuario_profesor: req.user.id };
    }

    const examenesFinales = await ExamenFinal.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "id_materia_plan",
        "fecha",
        "estado",
        "id_usuario_profesor",
      ],
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          attributes: ["id", "id_materia"],
          include: [
            {
              model: Materia,
              as: "materia",
              attributes: ["id", "id_tipo_materia", "nombre"],
            },
            {
              model: PlanEstudio,
              as: "planEstudio",
              attributes: ["id", "resolucion"],
              include: [
                {
                  model: Carrera,
                  as: "carrera",
                  attributes: ["nombre"],
                },
              ],
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
      order: [["fecha_creacion", "DESC"]],
    });

    const data = examenesFinales.map((examen) => {
      const plain = examen.get({ plain: true });
      const personaProfesor = plain.Profesor?.persona;
      return {
        id: plain.id,
        id_materia_plan: plain.id_materia_plan,
        fecha: plain.fecha,
        estado: plain.estado,
        id_usuario_profesor: plain.id_usuario_profesor,
        materiaPlan: plain.materiaPlan
          ? {
              id: plain.materiaPlan.id,
              id_materia: plain.materiaPlan.id_materia,
              materia: plain.materiaPlan.materia
                ? {
                    id: plain.materiaPlan.materia.id,
                    id_tipo_materia: plain.materiaPlan.materia.id_tipo_materia,
                    nombre: plain.materiaPlan.materia.nombre,
                  }
                : null,
              planEstudio: plain.materiaPlan.planEstudio
                ? {
                    id: plain.materiaPlan.planEstudio.id,
                    resolucion: plain.materiaPlan.planEstudio.resolucion,
                    carrera: plain.materiaPlan.planEstudio.carrera
                      ? {
                          nombre: plain.materiaPlan.planEstudio.carrera.nombre,
                        }
                      : null,
                  }
                : null,
            }
          : null,
        Profesor: personaProfesor
          ? {
              persona: {
                nombre: personaProfesor.nombre,
                apellido: personaProfesor.apellido,
              },
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error al listar exámenes finales:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const detalleExamenFinal = async (req, res) => {
  try {
    const { id } = req.params;

    const examen = await ExamenFinal.findByPk(id, {
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlan",
          include: [
            {
              model: Materia,
              as: "materia",
            },
            {
              model: PlanEstudio,
              as: "planEstudio",
              include: [
                {
                  model: Carrera,
                  as: "carrera",
                },
              ],
            },
          ],
        },
        {
          model: Usuario,
          as: "Profesor",
          include: [
            {
              model: Persona,
              as: "persona",
            },
          ],
        },
        {
          model: Usuario,
          as: "usuarioCreador",
          include: [
            {
              model: Persona,
              as: "persona",
            },
          ],
        },
        {
          model: InscripcionExamenFinal,
          as: "inscripciones",
          include: [
            {
              model: Usuario,
              as: "alumno",
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

    if (!examen) {
      return res.status(404).json({
        success: false,
        message: "Examen final no encontrado",
      });
    }

    // Formatear la respuesta similar a como lo hace el detalle de materia
    const detalleFormateado = {
      id: examen.id,
      materia: examen.materiaPlan?.materia?.nombre || "Sin nombre",
      id_materia: examen.materiaPlan?.materia?.id || null,
      estado: examen.estado,
      fecha: examen.fecha,
      carrera:
        examen.materiaPlan?.planEstudio?.carrera?.nombre || "Sin carrera",
      resolucion:
        examen.materiaPlan?.planEstudio?.resolucion || "Sin resolución",
      profesor: {
        id: examen.Profesor?.id,
        nombre: examen.Profesor?.persona?.nombre,
        apellido: examen.Profesor?.persona?.apellido,
        email: examen.Profesor?.persona?.email,
      },
      alumnos: (examen.inscripciones || []).map((inscripcion) => ({
        id_inscripcion: inscripcion.id,
        id_usuario: inscripcion.alumno?.id,
        nombre: inscripcion.alumno?.persona?.nombre,
        apellido: inscripcion.alumno?.persona?.apellido,
        email: inscripcion.alumno?.persona?.email,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        calificacion: inscripcion.nota,
        estado: inscripcion.estado,
      })),
      fecha_creacion: examen.fecha_creacion,
      creado_por: {
        nombre: examen.usuarioCreador?.persona?.nombre,
        apellido: examen.usuarioCreador?.persona?.apellido,
      },
    };

    res.status(200).json({
      success: true,
      data: detalleFormateado,
    });
  } catch (error) {
    console.error("Error al obtener detalle del examen final:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener alumnos inscriptos para asistencia
const obtenerAlumnosInscriptos = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripciones = await InscripcionExamenFinal.findAll({
      where: { id_examen_final: id },
      include: [
        {
          model: Usuario,
          as: "alumno",
          include: [
            {
              model: Persona,
              as: "persona",
            },
          ],
        },
      ],
    });

    // Obtener asistencias por separado
    const asistencias = await AsistenciaExamenFinal.findAll({
      where: { id_examen_final: id },
    });

    const asistenciasMap = asistencias.reduce((acc, asistencia) => {
      acc[asistencia.id_usuario_alumno] = asistencia.estado;
      return acc;
    }, {});

    const alumnosFormateados = inscripciones.map((inscripcion) => ({
      id_inscripcion: inscripcion.id,
      id_usuario: inscripcion.alumno?.id,
      nombre: inscripcion.alumno?.persona?.nombre,
      apellido: inscripcion.alumno?.persona?.apellido,
      email: inscripcion.alumno?.persona?.email,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      calificacion: inscripcion.nota,
      estado: inscripcion.estado,
      asistencia: asistenciasMap[inscripcion.alumno?.id] || null,
    }));

    res.status(200).json({
      success: true,
      data: alumnosFormateados,
    });
  } catch (error) {
    console.error("Error al obtener alumnos inscriptos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Registrar asistencia de alumno
const registrarAsistencia = async (req, res) => {
  try {
    const { idExamen } = req.params;
    const { id_usuario_alumno, presente } = req.body;
    const realizado_por = req.user.id;
    const userRole = req.user.rol;

    // Verificar que existe la inscripción
    const inscripcion = await InscripcionExamenFinal.findOne({
      where: {
        id_examen_final: idExamen,
        id_usuario_alumno,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: "Inscripción no encontrada",
      });
    }

    // Buscar asistencia existente
    const asistenciaExistente = await AsistenciaExamenFinal.findOne({
      where: {
        id_examen_final: idExamen,
        id_usuario_alumno,
      },
    });

    // Si ya existe asistencia y el usuario no es Administrador, no puede modificarla
    if (asistenciaExistente && userRole !== "Administrador") {
      return res.status(403).json({
        success: false,
        message: "La asistencia ya fue registrada. Solo un administrador puede modificarla.",
      });
    }

    let asistencia;
    if (asistenciaExistente) {
      // Actualizar (solo llega aquí si es admin)
      asistenciaExistente.estado = presente ? "PRESENTE" : "AUSENTE";
      asistenciaExistente.id_usuario_profesor_control = realizado_por;
      asistenciaExistente.modificado_por = realizado_por;
      await asistenciaExistente.save();
      asistencia = asistenciaExistente;
    } else {
      // Crear nueva
      asistencia = await AsistenciaExamenFinal.create({
        id_examen_final: idExamen,
        id_usuario_alumno,
        estado: presente ? "PRESENTE" : "AUSENTE",
        id_usuario_profesor_control: realizado_por,
        creado_por: realizado_por,
      });
    }

    res.status(200).json({
      success: true,
      message: "Asistencia registrada correctamente",
      data: asistencia,
    });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener calificaciones del examen
const obtenerCalificaciones = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripciones = await InscripcionExamenFinal.findAll({
      where: { id_examen_final: id },
      include: [
        {
          model: Usuario,
          as: "alumno",
          include: [
            {
              model: Persona,
              as: "persona",
            },
          ],
        },
      ],
    });

    // Obtener asistencias por separado
    const asistencias = await AsistenciaExamenFinal.findAll({
      where: { id_examen_final: id },
    });

    const asistenciasMap = asistencias.reduce((acc, asistencia) => {
      acc[asistencia.id_usuario_alumno] = asistencia.estado;
      return acc;
    }, {});

    const calificaciones = inscripciones.map((inscripcion) => ({
      id_inscripcion: `${inscripcion.id_usuario_alumno}-${inscripcion.id_examen_final}`,
      id_usuario_alumno: inscripcion.id_usuario_alumno,
      id_examen_final: inscripcion.id_examen_final,
      alumno: {
        id: inscripcion.alumno?.id,
        nombre: inscripcion.alumno?.persona?.nombre,
        apellido: inscripcion.alumno?.persona?.apellido,
        email: inscripcion.alumno?.persona?.email,
      },
      calificacion: inscripcion.nota,
      bloqueada: inscripcion.bloqueada || false,
      asistencia: asistenciasMap[inscripcion.id_usuario_alumno] || null,
    }));

    res.status(200).json({
      success: true,
      data: calificaciones,
    });
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Actualizar calificación
const actualizarCalificacion = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const { calificacion } = req.body;
    const userRole = req.user.rol;
    const userId = req.user.id;

    // Validar que la calificación esté entre 0 y 10
    if (calificacion < 0 || calificacion > 10) {
      return res.status(400).json({
        success: false,
        message: "La calificación debe estar entre 0 y 10",
      });
    }

    // Parsear el idInscripcion compuesto (formato: "id_usuario_alumno-id_examen_final")
    const [id_usuario_alumno, id_examen_final] = idInscripcion.split('-').map(Number);

    if (!id_usuario_alumno || !id_examen_final) {
      return res.status(400).json({
        success: false,
        message: "ID de inscripción inválido",
      });
    }

    const inscripcion = await InscripcionExamenFinal.findOne({
      where: {
        id_usuario_alumno,
        id_examen_final,
      },
      include: [
        {
          model: ExamenFinal,
          as: "examenFinal",
          attributes: ["id_usuario_profesor", "id_materia_plan"],
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              include: [
                {
                  model: MateriaPlanCicloLectivo,
                  as: "ciclos",
                  attributes: ["tipo_aprobacion", "id"],
                },
              ],
            },
          ],
        },
        {
          model: InscripcionMateria,
          as: "inscripcionMateria",
        },
      ],
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: "Inscripción no encontrada",
      });
    }

    // Verificar que el profesor que intenta calificar es el asignado al examen
    if (userRole === "Profesor" && inscripcion.examenFinal.id_usuario_profesor !== userId) {
      return res.status(403).json({
        success: false,
        message: "Solo el profesor asignado a este examen puede calificar.",
      });
    }

    // Si la calificación está bloqueada y el usuario no es administrador
    if (inscripcion.bloqueada && userRole !== "Administrador") {
      return res.status(403).json({
        success: false,
        message:
          "La calificación está bloqueada. Solo un administrador puede modificarla.",
      });
    }

    const datosPreviosInscripcionMateria = inscripcion.inscripcionMateria ? {
      estado: inscripcion.inscripcionMateria.estado,
      nota_final: inscripcion.inscripcionMateria.nota_final,
      fecha_finalizacion: inscripcion.inscripcionMateria.fecha_finalizacion,
      origen_aprobacion: inscripcion.inscripcionMateria.origen_aprobacion,
    } : null;

    // Determinar si es la primera vez que se pone nota (para bloqueo automático)
    const esPrimeraVez = inscripcion.nota === null || inscripcion.nota === undefined;

    // Actualizar calificación en InscripcionExamenFinal
    inscripcion.nota = calificacion;
    
    // Bloquear automáticamente cuando un profesor pone la nota por primera vez
    if (userRole === "Profesor" && esPrimeraVez) {
      inscripcion.bloqueada = true;
    }
    
    inscripcion.modificado_por = userId;
    await inscripcion.save();

    // Actualizar estado en inscripcion_materia según tipo de aprobación
    if (inscripcion.inscripcionMateria) {
      const tipoAprobacion = inscripcion.examenFinal?.materiaPlan?.ciclos?.[0]?.tipo_aprobacion;
      let nuevoEstado = null;

      if (tipoAprobacion) {
        // EP (Exclusivamente Promocionable): 7 o más = Aprobada, menos de 7 = Desaprobada
        // P (Promocionable): 7 o más = Aprobada, 4 a 6.99 = Regularizada, menos de 4 = Desaprobada
        // NP (No Promocionable): 4 o más = Aprobada, menos de 4 = Desaprobada
        if (tipoAprobacion === "EP") {
          nuevoEstado = calificacion >= 7 ? "Aprobada" : "Desaprobada";
        } else if (tipoAprobacion === "P") {
          if (calificacion >= 7) {
            nuevoEstado = "Aprobada";
          } else if (calificacion >= 4) {
            nuevoEstado = "Regularizada";
          } else {
            nuevoEstado = "Desaprobada";
          }
        } else if (tipoAprobacion === "NP") {
          nuevoEstado = calificacion >= 4 ? "Aprobada" : "Desaprobada";
        }

        if (nuevoEstado) {
          inscripcion.inscripcionMateria.estado = nuevoEstado;
          inscripcion.inscripcionMateria.modificado_por = userId;
          
          // Si el estado es "Aprobada", actualizar campos adicionales
          if (nuevoEstado === "Aprobada") {
            inscripcion.inscripcionMateria.nota_final = calificacion;
            inscripcion.inscripcionMateria.fecha_finalizacion = new Date();
            inscripcion.inscripcionMateria.origen_aprobacion = "Final";
            inscripcion.inscripcionMateria.id_inscripcion_examen_final_aprobatorio = id_examen_final;
          } else {
            // Si cambió de Aprobada a otro estado, limpiar los campos
            if (datosPreviosInscripcionMateria?.estado === "Aprobada") {
              inscripcion.inscripcionMateria.nota_final = null;
              inscripcion.inscripcionMateria.fecha_finalizacion = null;
              inscripcion.inscripcionMateria.origen_aprobacion = null;
              inscripcion.inscripcionMateria.id_inscripcion_examen_final_aprobatorio = null;
            }
          }
          
          await inscripcion.inscripcionMateria.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Calificación actualizada correctamente",
      data: inscripcion,
    });
  } catch (error) {
    console.error("Error al actualizar calificación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Actualizar configuración del examen (solo administrador)
const actualizarConfiguracion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, id_usuario_profesor } = req.body;
    const userRole = req.user.rol;

    if (userRole !== "Administrador") {
      return res.status(403).json({
        success: false,
        message:
          "Solo los administradores pueden modificar la configuración del examen",
      });
    }

    const examen = await ExamenFinal.findByPk(id);
    if (!examen) {
      return res.status(404).json({
        success: false,
        message: "Examen no encontrado",
      });
    }

    // Validar fecha si se proporciona
    if (fecha) {
      const fechaExamen = parsearFechaLocal(fecha);
      if (!fechaExamen || isNaN(fechaExamen.getTime())) {
        return res.status(400).json({
          success: false,
          message: "La fecha proporcionada no es válida",
        });
      }

      const hoy = new Date();

      if (compararSoloFechas(fechaExamen, hoy) < 0) {
        return res.status(400).json({
          success: false,
          message: "La fecha del examen no puede ser en el pasado",
        });
      }

      examen.fecha = fechaExamen;
    }

    // Validar profesor si se proporciona
    if (id_usuario_profesor) {
      const profesor = await Usuario.findByPk(id_usuario_profesor);
      if (!profesor) {
        return res.status(404).json({
          success: false,
          message: "Profesor no encontrado",
        });
      }
      examen.id_usuario_profesor = id_usuario_profesor;
    }

    examen.modificado_por = req.user.id;
    await examen.save();

    res.status(200).json({
      success: true,
      message: "Configuración del examen actualizada correctamente",
      data: examen,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Bloquear/desbloquear calificación de examen final
const bloquearCalificacion = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const { bloqueada } = req.body;

    // Verificar que es administrador
    if (req.user.rol !== "Administrador") {
      return res.status(403).json({
        success: false,
        message:
          "Solo los administradores pueden modificar el estado de bloqueo",
      });
    }

    // Parsear el idInscripcion compuesto (formato: "id_usuario_alumno-id_examen_final")
    const [id_usuario_alumno, id_examen_final] = idInscripcion.split('-').map(Number);

    if (!id_usuario_alumno || !id_examen_final) {
      return res.status(400).json({
        success: false,
        message: "ID de inscripción inválido",
      });
    }

    // Buscar la inscripción
    const inscripcion = await InscripcionExamenFinal.findOne({
      where: {
        id_usuario_alumno,
        id_examen_final,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: "Inscripción no encontrada",
      });
    }

    // Actualizar estado de bloqueo
    inscripcion.bloqueada = bloqueada;
    inscripcion.modificado_por = req.user.id;
    await inscripcion.save();

    res.status(200).json({
      success: true,
      message: `Calificación ${
        bloqueada ? "bloqueada" : "desbloqueada"
      } correctamente`,
      data: inscripcion,
    });
  } catch (error) {
    console.error("Error al cambiar estado de bloqueo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener profesores disponibles para una materia
const obtenerProfesoresPorMateria = async (req, res) => {
  try {
    const { idMateria } = req.params;

    // Buscar todos los profesores que han enseñado esta materia históricamente
    const profesores = await ProfesorMateria.findAll({
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          attributes: ["id", "ciclo_lectivo"], // Incluir ciclo_lectivo para referencia
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              attributes: ["id", "id_materia"],
              where: { id_materia: idMateria },
            },
          ],
        },
        {
          model: Usuario,
          as: "profesor",
          attributes: ["id"],
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: ["nombre", "apellido", "email"],
            },
          ],
        },
      ],
    });

    // Formatear la respuesta eliminando duplicados y agregando información histórica
    const profesoresMap = new Map();

    profesores.forEach((pm) => {
      if (pm.profesor && pm.profesor.id) {
        const profesorId = pm.profesor.id;

        if (!profesoresMap.has(profesorId)) {
          profesoresMap.set(profesorId, {
            id: pm.profesor.id,
            nombre: pm.profesor.persona?.nombre,
            apellido: pm.profesor.persona?.apellido,
            email: pm.profesor.persona?.email,
            ciclosLectivos: new Set(), // Para almacenar los ciclos únicos
            rol: pm.rol, // Tomar el rol (puede variar por ciclo)
          });
        }

        // Agregar el ciclo lectivo a la lista
        if (pm.ciclo?.ciclo_lectivo) {
          profesoresMap
            .get(profesorId)
            .ciclosLectivos.add(pm.ciclo.ciclo_lectivo);
        }
      }
    });

    // Convertir Map a array y formatear la respuesta final
    const profesoresUnicos = Array.from(profesoresMap.values()).map(
      (profesor) => ({
        id: profesor.id,
        nombre: profesor.nombre,
        apellido: profesor.apellido,
        email: profesor.email,
        rol: profesor.rol,
        ciclosLectivos: Array.from(profesor.ciclosLectivos).sort(
          (a, b) => b - a
        ), // Ordenar de más reciente a más antiguo
        cantidadCiclos: profesor.ciclosLectivos.size,
      })
    );

    console.log(
      `Encontrados ${profesoresUnicos.length} profesores únicos para la materia ${idMateria}`
    ); // Debug

    res.status(200).json({
      success: true,
      data: profesoresUnicos,
      message: `Se encontraron ${profesoresUnicos.length} profesores que han enseñado esta materia`,
    });
  } catch (error) {
    console.error("Error al obtener profesores por materia:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

module.exports = {
  registrarExamenFinal,
  listarExamenesFinales,
  detalleExamenFinal,
  obtenerAlumnosInscriptos,
  registrarAsistencia,
  obtenerCalificaciones,
  actualizarCalificacion,
  actualizarConfiguracion,
  bloquearCalificacion,
  obtenerProfesoresPorMateria,
};
