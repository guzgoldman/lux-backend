// models/historial_inscripcion_examen_final.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'historial_inscripcion_examen_final',
    {
      id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario_alumno: { type: DataTypes.INTEGER, allowNull: false },
      id_examen_final:   { type: DataTypes.INTEGER, allowNull: false },
      accion:      { type: DataTypes.STRING(10), allowNull: false },
      datos_previos:{type: DataTypes.TEXT },
      realizado_por:{type: DataTypes.INTEGER, allowNull: false },
      fecha:       { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
      comentario:  { type: DataTypes.TEXT }
    },
    {
      tableName: 'historial_inscripcion_examen_final',
      timestamps: false,
      indexes: [
        { name:"ind_hist_insc_ex_final", fields: ['id_usuario_alumno', 'id_examen_final'] },
        { fields: ['fecha'] }
      ]
    }
  );
};
