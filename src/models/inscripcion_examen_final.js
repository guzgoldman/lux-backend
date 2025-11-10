module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'inscripcion_examen_final',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario_alumno: { type: DataTypes.INTEGER, allowNull: false },
      id_examen_final:   { type: DataTypes.INTEGER, allowNull: false },
      id_inscripcion_materia: { type: DataTypes.INTEGER, allowNull: false },
      fecha_inscripcion: { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      nota:              { type: DataTypes.DECIMAL(4,2) },
      bloqueada:         { type: DataTypes.BOOLEAN, defaultValue: false },
      creado_por:        { type: DataTypes.INTEGER, allowNull: false },
      fecha_creacion:    { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      modificado_por:    { type: DataTypes.INTEGER },
      fecha_modificacion:{
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate:    sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'inscripcion_examen_final',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_usuario_alumno', 'id_examen_final'] },
        { fields: ['fecha_inscripcion'] }
      ],
      hooks: {
        /**
         * Hook que se dispara después de que se elimina
         * un registro de 'inscripcion_examen_final'.
         * @param {Object} inscripcion - El registro que fue eliminado.
         * @param {Object} options - Opciones de la transacción.
         */
        afterDestroy: async (inscripcion, options) => {
          // 1. Buscar la 'inscripcion_materia' que fue aprobada
          //    por este examen que se está borrando.
          //    (Asumimos que 'db' tiene tus modelos cargados)
          const db = require('./index'); // Ajusta la ruta a tu 'index.js' de modelos

          const inscripcionMateria = await db.InscripcionMateria.findOne({
            where: {
              id_inscripcion_examen_final_aprobatorio: inscripcion.id
            },
            transaction: options.transaction // Asegura que se ejecute en la misma transacción
          });

          // 2. Si se encuentra, revertir su estado.
          if (inscripcionMateria) {
            await inscripcionMateria.update({
              estado: 'Revision-FI', 
              nota_final: null,
              fecha_finalizacion: null,
              id_inscripcion_examen_final_aprobatorio: null
            }, {
              transaction: options.transaction // Asegura la transacción
            });
          }
        }
      }
    }
  );
};
