module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'preinscripcion_estado',
    {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        defaultValue: 1
      },
      abierta: { type: DataTypes.TINYINT }
    },
    {
      tableName: 'preinscripcion_estado',
      timestamps: false
    }
  );
};