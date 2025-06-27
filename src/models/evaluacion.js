module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'evaluacion',
    {
      id:                    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_inscripcion_materia:{ type: DataTypes.INTEGER, allowNull: false },
      id_evaluacion_tipo:    { type: DataTypes.INTEGER, allowNull: false },
      nota:                  { type: DataTypes.DECIMAL(4,2), allowNull: false },
      fecha_registro:        { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      bloqueada:             { type: DataTypes.TINYINT, defaultValue: 0 }
    },
    {
      tableName: 'evaluacion',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_inscripcion_materia', 'id_evaluacion_tipo'] }
      ]
    }
  );
};
