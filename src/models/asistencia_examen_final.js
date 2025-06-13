// models/asistencia_examen_final.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'asistencia_examen_final',
    {
      id:                       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_examen_final:          { type: DataTypes.INTEGER },
      id_usuario_alumno:        { type: DataTypes.INTEGER },
      estado:                   { type: DataTypes.STRING(20), allowNull: false },
      id_usuario_profesor_control:{type: DataTypes.INTEGER, allowNull: false },
      creado_por:               { type: DataTypes.INTEGER, allowNull: false },
      fecha_creacion:           { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      modificado_por:           { type: DataTypes.INTEGER },
      fecha_modificacion: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate:    sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'asistencia_examen_final',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_examen_final', 'id_usuario_alumno'] },
        { fields: ['fecha_creacion'] }
      ]
    }
  );
};
