module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'preinscripcion_estado',
    {
      abierta: { type: DataTypes.TINYINT }
    },
    {
      tableName: 'preinscripcion_estado',
      timestamps: false
    }
  );
};
