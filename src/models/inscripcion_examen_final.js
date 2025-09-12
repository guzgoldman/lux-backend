module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'inscripcion_examen_final',
    {
      id_usuario_alumno: { type: DataTypes.INTEGER, primaryKey: true },
      id_examen_final:   { type: DataTypes.INTEGER, primaryKey: true },
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
      ]
    }
  );
};
