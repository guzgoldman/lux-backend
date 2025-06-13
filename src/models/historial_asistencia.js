// models/historial_asistencia.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'historial_asistencia',
    {
      id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_asistencia: { type: DataTypes.INTEGER, allowNull: false },
      accion:        { type: DataTypes.STRING(10), allowNull: false },
      datos_previos: { type: DataTypes.TEXT },
      realizado_por: { type: DataTypes.INTEGER, allowNull: false },
      fecha:         { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
      comentario:    { type: DataTypes.TEXT }
    },
    {
      tableName: 'historial_asistencia',
      timestamps: false,
      indexes: [
        { fields: ['id_asistencia'] },
        { fields: ['fecha'] }
      ]
    }
  );
};