module.exports = (sequelize, DataTypes) => {
  const CalificacionCuatrimestre = sequelize.define(
    "calificacion_cuatrimestre",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_inscripcion_materia: { type: DataTypes.INTEGER, allowNull: false },
      cuatrimestre: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 2 },
      },
      calificacion: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 10 },
      },
      bloqueada: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "calificacion_cuatrimestre",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["id_inscripcion_materia", "cuatrimestre"] },
        { fields: ["id_inscripcion_materia"] },
      ],
      hooks: {
        afterCreate: async (calificacion, options) => {
          // Usar setTimeout para ejecutar después de que se complete la transacción
          setTimeout(async () => {
            try {
              const RegularizacionUtils = require("../utils/regularizacion");
              
              await RegularizacionUtils.actualizarEstadoRegularizacion(
                calificacion.id_inscripcion_materia
              );
            } catch (error) {
              console.error(
                "Error al actualizar estado de regularización después de crear calificación:",
                error
              );
            }
          }, 100);
        },
        afterUpdate: async (calificacion, options) => {
          // Usar setTimeout para ejecutar después de que se complete la transacción
          setTimeout(async () => {
            try {
              const RegularizacionUtils = require("../utils/regularizacion");              
              await RegularizacionUtils.actualizarEstadoRegularizacion(
                calificacion.id_inscripcion_materia
              );
            } catch (error) {
              console.error(
                "Error al actualizar estado de regularización después de actualizar calificación:",
                error
              );
            }
          }, 100);
        },
        afterDestroy: async (calificacion, options) => {
          try {
            const RegularizacionUtils = require("../utils/regularizacion");
            await RegularizacionUtils.actualizarEstadoRegularizacion(
              calificacion.id_inscripcion_materia
            );
          } catch (error) {
            console.error(
              "Error al actualizar estado de regularización después de eliminar calificación:",
              error
            );
          }
        },
      },
    }
  );

  return CalificacionCuatrimestre;
};
