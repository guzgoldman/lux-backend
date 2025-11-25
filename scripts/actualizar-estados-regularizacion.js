const { inscripcion_materia } = require("../src/models");
const RegularizacionUtils = require("../src/utils/regularizacion");

/**
 * Script para actualizar todos los estados de regularización existentes
 */
async function actualizarTodosLosEstados() {
  try {
    // Obtener todas las inscripciones que no están aprobadas ni desaprobadas
    const inscripciones = await inscripcion_materia.findAll({
      where: {
        estado: ["Cursando", "Regularizada"],
      },
      attributes: ["id", "id_usuario_alumno"],
    });
    let actualizadas = 0;
    let errores = 0;

    for (const inscripcion of inscripciones) {
      try {
        const resultado =
          await RegularizacionUtils.actualizarEstadoRegularizacion(
            inscripcion.id
          );

        if (resultado.success) {
          actualizadas++;
        } else {
          errores++;
          console.log(
            `Error en inscripción ${inscripcion.id}: ${resultado.error}`
          );
        }
      } catch (error) {
        errores++;
        console.log(`Error en inscripción ${inscripcion.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error durante la actualización masiva:", error);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  actualizarTodosLosEstados()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
}

module.exports = actualizarTodosLosEstados;
