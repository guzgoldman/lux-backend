const {
  Materia,
  MateriaPlan,
  Correlativa,
  InscripcionExamenFinal,
  AsistenciaExamenFinal,
  ExamenFinal,
  InscripcionMateria,
  MateriaPlanCicloLectivo,
  HistorialAsistenciaExamenFinal,
  HistorialInscripcionExamenFinal,
  CalificacionCuatrimestre,
  ProfesorMateria,
  Persona,
  Usuario,
  PlanEstudio,
  Carrera,
} = require("../../../models");
const { parsearFechaLocal, compararSoloFechas } = require("../../../utils/dateUtils");

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

    const materiaPlanCicloLectivo = await MateriaPlanCicloLectivo.findByPk(
      idMateria
    );
    if (!materiaPlanCicloLectivo) {
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
      id_materia_plan_ciclo_lectivo: idMateria,
      fecha: fechaExamen,
      id_usuario_profesor: idProfesor,
      creado_por,
      estado: "Pendiente",
    });

    // Obtener el examen creado con información relacionada
    const examenCreado = await ExamenFinal.findByPk(nuevoExamenFinal.id, {
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
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

// Listar exámenes finales
const listarExamenesFinales = async (req, res) => {
  try {
    const examenesFinales = await ExamenFinal.findAll({
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: 'ciclo',
          include: [
            {
              model: MateriaPlan,
              as: 'materiaPlan',
              include: [
                {
                  model: Materia,
                  as: 'materia'
                },
                {
                  model: PlanEstudio,
                  as: 'planEstudio',
                  include: [
                    {
                      model: Carrera,
                      as: 'carrera'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Usuario,
          as: 'Profesor',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: examenesFinales
    });

  } catch (error) {
    console.error('Error al listar exámenes finales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener detalles de un examen final específico
const detalleExamenFinal = async (req, res) => {
  try {
    const { id } = req.params;

    const examen = await ExamenFinal.findByPk(id, {
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: 'ciclo',
          include: [
            {
              model: MateriaPlan,
              as: 'materiaPlan',
              include: [
                {
                  model: Materia,
                  as: 'materia'
                },
                {
                  model: PlanEstudio,
                  as: 'planEstudio',
                  include: [
                    {
                      model: Carrera,
                      as: 'carrera'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Usuario,
          as: 'Profesor',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioCreador',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        },
        {
          model: InscripcionExamenFinal,
          as: 'inscripciones',
          include: [
            {
              model: Usuario,
              as: 'alumno',
              include: [
                {
                  model: Persona,
                  as: 'persona'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!examen) {
      return res.status(404).json({
        success: false,
        message: 'Examen final no encontrado'
      });
    }

    // Formatear la respuesta similar a como lo hace el detalle de materia
    const detalleFormateado = {
      id: examen.id,
      materia: examen.ciclo?.materiaPlan?.materia?.nombre || 'Sin nombre',
      id_materia: examen.ciclo?.materiaPlan?.materia?.id || null,
      estado: examen.estado,
      fecha: examen.fecha,
      carrera: examen.ciclo?.materiaPlan?.planEstudio?.carrera?.nombre || 'Sin carrera',
      resolucion: examen.ciclo?.materiaPlan?.planEstudio?.resolucion || 'Sin resolución',
      profesor: {
        id: examen.Profesor?.id,
        nombre: examen.Profesor?.persona?.nombre,
        apellido: examen.Profesor?.persona?.apellido,
        email: examen.Profesor?.persona?.email
      },
      alumnos: (examen.inscripciones || []).map(inscripcion => ({
        id_inscripcion: inscripcion.id,
        id_usuario: inscripcion.alumno?.id,
        nombre: inscripcion.alumno?.persona?.nombre,
        apellido: inscripcion.alumno?.persona?.apellido,
        email: inscripcion.alumno?.persona?.email,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        calificacion: inscripcion.nota,
        estado: inscripcion.estado
      })),
      fecha_creacion: examen.fecha_creacion,
      creado_por: {
        nombre: examen.usuarioCreador?.persona?.nombre,
        apellido: examen.usuarioCreador?.persona?.apellido
      }
    };

    res.status(200).json({
      success: true,
      data: detalleFormateado
    });

  } catch (error) {
    console.error('Error al obtener detalle del examen final:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
          as: 'alumno',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        }
      ]
    });

    const alumnosFormateados = inscripciones.map(inscripcion => ({
      id_inscripcion: inscripcion.id,
      id_usuario: inscripcion.alumno?.id,
      nombre: inscripcion.alumno?.persona?.nombre,
      apellido: inscripcion.alumno?.persona?.apellido,
      email: inscripcion.alumno?.persona?.email,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      calificacion: inscripcion.nota,
      estado: inscripcion.estado
    }));

    res.status(200).json({
      success: true,
      data: alumnosFormateados
    });

  } catch (error) {
    console.error('Error al obtener alumnos inscriptos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Registrar asistencia de alumno
const registrarAsistencia = async (req, res) => {
  try {
    const { idExamen } = req.params;
    const { id_usuario_alumno, presente } = req.body;
    const realizado_por = req.user.id;

    // Verificar que existe la inscripción
    const inscripcion = await InscripcionExamenFinal.findOne({
      where: {
        id_examen_final: idExamen,
        id_usuario_alumno
      }
    });

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Buscar o crear registro de asistencia
    const [asistencia, created] = await AsistenciaExamenFinal.findOrCreate({
      where: {
        id_examen_final: idExamen,
        id_usuario_alumno
      },
      defaults: {
        presente,
        realizado_por
      }
    });

    if (!created) {
      // Si ya existe, actualizar
      asistencia.presente = presente;
      asistencia.realizado_por = realizado_por;
      await asistencia.save();
    }

    res.status(200).json({
      success: true,
      message: 'Asistencia registrada correctamente',
      data: asistencia
    });

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
          as: 'alumno',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        }
      ]
    });

    // Obtener asistencias por separado
    const asistencias = await AsistenciaExamenFinal.findAll({
      where: { id_examen_final: id }
    });

    const asistenciasMap = asistencias.reduce((acc, asistencia) => {
      acc[asistencia.id_usuario_alumno] = asistencia.estado;
      return acc;
    }, {});

    const calificaciones = inscripciones.map(inscripcion => ({
      id_inscripcion: inscripcion.id,
      alumno: {
        id: inscripcion.alumno?.id,
        nombre: inscripcion.alumno?.persona?.nombre,
        apellido: inscripcion.alumno?.persona?.apellido,
        email: inscripcion.alumno?.persona?.email
      },
      calificacion: inscripcion.nota,
      bloqueada: inscripcion.bloqueada || false,
      asistencia: asistenciasMap[inscripcion.id_usuario_alumno] || null
    }));

    res.status(200).json({
      success: true,
      data: calificaciones
    });

  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar calificación
const actualizarCalificacion = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const { calificacion } = req.body;
    const userRole = req.user.rol;

    // Validar que la calificación esté entre 0 y 10
    if (calificacion < 0 || calificacion > 10) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 0 y 10'
      });
    }

    const inscripcion = await InscripcionExamenFinal.findByPk(idInscripcion);
    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Si la calificación está bloqueada y el usuario no es administrador
    if (inscripcion.bloqueada && userRole !== "Administrador") {
      return res.status(403).json({
        success: false,
        message: 'La calificación está bloqueada. Solo un administrador puede modificarla.'
      });
    }

    // Actualizar calificación
    inscripcion.nota = calificacion;
    inscripcion.bloqueada = userRole !== "Administrador"; // Solo se mantiene desbloqueada si es admin
    await inscripcion.save();

    res.status(200).json({
      success: true,
      message: 'Calificación actualizada correctamente',
      data: inscripcion
    });

  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
        message: 'Solo los administradores pueden modificar la configuración del examen'
      });
    }

    const examen = await ExamenFinal.findByPk(id);
    if (!examen) {
      return res.status(404).json({
        success: false,
        message: 'Examen no encontrado'
      });
    }

    // Validar fecha si se proporciona
    if (fecha) {
      const fechaExamen = parsearFechaLocal(fecha);
      if (!fechaExamen || isNaN(fechaExamen.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'La fecha proporcionada no es válida'
        });
      }

      const hoy = new Date();
      
      if (compararSoloFechas(fechaExamen, hoy) < 0) {
        return res.status(400).json({
          success: false,
          message: 'La fecha del examen no puede ser en el pasado'
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
          message: 'Profesor no encontrado'
        });
      }
      examen.id_usuario_profesor = id_usuario_profesor;
    }

    examen.modificado_por = req.user.id;
    await examen.save();

    res.status(200).json({
      success: true,
      message: 'Configuración del examen actualizada correctamente',
      data: examen
    });

  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Bloquear/desbloquear calificación de examen final
const bloquearCalificacion = async (req, res) => {
  try {
    const { idInscripcion } = req.params;
    const { bloqueada } = req.body;

    // Verificar que es administrador
    if (req.user.rol !== 'Administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden modificar el estado de bloqueo'
      });
    }

    // Buscar la inscripción
    const inscripcion = await InscripcionExamenFinal.findByPk(idInscripcion);

    if (!inscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Actualizar estado de bloqueo
    inscripcion.bloqueada = bloqueada;
    inscripcion.modificado_por = req.user.id;
    await inscripcion.save();

    res.status(200).json({
      success: true,
      message: `Calificación ${bloqueada ? 'bloqueada' : 'desbloqueada'} correctamente`,
      data: inscripcion
    });

  } catch (error) {
    console.error('Error al cambiar estado de bloqueo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener profesores disponibles para una materia
const obtenerProfesoresPorMateria = async (req, res) => {
  try {
    const { idMateria } = req.params;

    // Buscar todos los profesores que enseñan esta materia
    const profesores = await ProfesorMateria.findAll({
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: 'ciclo',
          include: [
            {
              model: MateriaPlan,
              as: 'materiaPlan',
              where: { id_materia: idMateria }
            }
          ]
        },
        {
          model: Usuario,
          as: 'profesor',
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ]
        }
      ]
    });

    // Formatear la respuesta eliminando duplicados
    const profesoresUnicos = [];
    const idsVistos = new Set();

    profesores.forEach(pm => {
      if (pm.profesor && !idsVistos.has(pm.profesor.id)) {
        idsVistos.add(pm.profesor.id);
        profesoresUnicos.push({
          id: pm.profesor.id,
          nombre: pm.profesor.persona?.nombre,
          apellido: pm.profesor.persona?.apellido,
          email: pm.profesor.persona?.email
        });
      }
    });

    res.status(200).json({
      success: true,
      data: profesoresUnicos
    });

  } catch (error) {
    console.error('Error al obtener profesores por materia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
  obtenerProfesoresPorMateria
};
