module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'preinscripcion_estado',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vigente: { type: DataTypes.TINYINT }
    },
    {
      tableName: 'preinscripcion_estado',
      timestamps: false
    }
  );
};
