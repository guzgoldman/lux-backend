module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'asistencia',
    {
      id:                        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_clase:                  { type: DataTypes.INTEGER },
      id_usuario_alumno:         { type: DataTypes.INTEGER },
      estado_asistencia:         { type: DataTypes.STRING(20) },
      id_usuario_profesor_registro:{type: DataTypes.INTEGER },
      hora_registro:             { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      creado_por:                { type: DataTypes.INTEGER, allowNull: false },
      modificado_por:            { type: DataTypes.INTEGER },
      fecha_modificacion: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate:    sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'asistencia',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_clase', 'id_usuario_alumno'] },
        { fields: ['hora_registro'] }
      ]
    }
  );
};
