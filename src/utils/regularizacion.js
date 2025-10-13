const {
  InscripcionMateria,
  CalificacionCuatrimestre,
  MateriaPlanCicloLectivo,
  MateriaPlan,
} = require("../models");

/**
 * Utilidades para manejar la lógica de regularización de materias
 */
class RegularizacionUtils {
  /**
   * Actualiza el estado de regularización de una inscripción basado en las calificaciones
   * @param {number} idInscripcionMateria - ID de la inscripción a evaluar
   * @returns {Promise<object>} Resultado de la actualización
   */
  static async actualizarEstadoRegularizacion(idInscripcionMateria) {
    try {
      // Obtener la inscripción con sus relaciones necesarias
      const inscripcion = await InscripcionMateria.findByPk(
        idInscripcionMateria,
        {
          include: [
            {
              model: MateriaPlanCicloLectivo,
              as: "ciclo",
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                },
              ],
            },
          ],
        }
      );

      if (!inscripcion) {
        throw new Error("Inscripción no encontrada");
      }

      // Obtener las calificaciones de la inscripción
      const calificaciones = await CalificacionCuatrimestre.findAll({
        where: { id_inscripcion_materia: idInscripcionMateria },
        order: [["cuatrimestre", "ASC"]],
      });

      if (calificaciones.length === 0) {
        // Si no hay calificaciones, mantener estado 'cursando'
        return {
          success: true,
          estado: "Cursando",
          message: "No hay calificaciones registradas",
        };
      }

      const materiaPlan = inscripcion.ciclo?.materiaPlan;
      const tipoAprobacion = inscripcion.ciclo?.tipo_aprobacion;
      const duracion = materiaPlan?.duracion;

      // Determinar si la materia es semestral (1 cuatrimestre) o anual (2 cuatrimestres)
      const esSemestral = duracion === "Semestral";
      const cuatrimestresEsperados = esSemestral ? 1 : 2;
      // Verificar si tenemos todas las calificaciones necesarias
      if (calificaciones.length < cuatrimestresEsperados) {
        return {
          success: true,
          estado: "Cursando",
          message: `Faltan calificaciones. Se esperan ${cuatrimestresEsperados} cuatrimestre(s)`,
        };
      }

      // Calcular promedio de calificaciones
      const sumaCalificaciones = calificaciones.reduce(
        (suma, cal) => suma + cal.calificacion,
        0
      );
      const promedio = sumaCalificaciones / calificaciones.length;

      // Determinar nuevo estado según tipo de aprobación
      let nuevoEstado;

      if (tipoAprobacion === "EP") {
        // Exclusivamente Promocionable: 7+ aprobada, <7 desaprobada (no se puede regularizar)
        if (promedio >= 7) {
          nuevoEstado = "aprobada";
        } else {
          nuevoEstado = "desaprobada";
        }
      } else {
        // P y NP: 4+ regularizada, <4 desaprobada
        if (promedio >= 4) {
          nuevoEstado = "regularizada";
        } else {
          nuevoEstado = "desaprobada";
        }
      }

      // Actualizar el estado en la base de datos
      await inscripcion.update({ estado: nuevoEstado });

      return {
        success: true,
        estado: nuevoEstado,
        promedio: promedio,
        tipoAprobacion: tipoAprobacion,
        message: `Estado actualizado a ${nuevoEstado}. Promedio: ${promedio.toFixed(
          2
        )}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Actualiza el estado de regularización para todas las inscripciones de un alumno
   * @param {number} idUsuarioAlumno - ID del usuario alumno
   * @returns {Promise<object>} Resultado de las actualizaciones
   */
  static async actualizarEstadosAlumno(idUsuarioAlumno) {
    try {
      const inscripciones = await InscripcionMateria.findAll({
        where: {
          id_usuario_alumno: idUsuarioAlumno,
          estado: ["Cursando", "Regularizada"], // Solo actualizar las que están en curso o regularizadas
        },
      });

      const resultados = [];
      for (const inscripcion of inscripciones) {
        const resultado = await this.actualizarEstadoRegularizacion(
          inscripcion.id
        );
        resultados.push({
          idInscripcion: inscripcion.id,
          ...resultado,
        });
      }

      return {
        success: true,
        resultados: resultados,
        message: `Se actualizaron ${resultados.length} inscripciones`,
      };
    } catch (error) {
      console.error("Error al actualizar estados del alumno:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verifica si una inscripción está regularizada
   * @param {number} idInscripcionMateria - ID de la inscripción
   * @returns {Promise<boolean>} True si está regularizada
   */
  static async estaRegularizada(idInscripcionMateria) {
    try {
      const inscripcion = await InscripcionMateria.findByPk(
        idInscripcionMateria
      );
      return inscripcion?.estado === "Regularizada";
    } catch (error) {
      console.error("Error al verificar regularización:", error);
      return false;
    }
  }

  /**
   * Obtiene todas las materias regularizadas de un alumno
   * @param {number} idUsuarioAlumno - ID del usuario alumno
   * @returns {Promise<Array>} Lista de inscripciones regularizadas
   */
  static async obtenerMateriasRegularizadas(idUsuarioAlumno) {
    try {
      const inscripciones = await InscripcionMateria.findAll({
        where: {
          id_usuario_alumno: idUsuarioAlumno,
          estado: "Regularizada",
        },
        include: [
          {
            model: MateriaPlanCicloLectivo,
            as: "ciclo",
            include: [
              {
                model: MateriaPlan,
                as: "materiaPlan",
                include: ["materia"],
              },
            ],
          },
        ],
      });

      return {
        success: true,
        data: inscripciones,
      };
    } catch (error) {
      console.error("Error al obtener materias regularizadas:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = RegularizacionUtils;
