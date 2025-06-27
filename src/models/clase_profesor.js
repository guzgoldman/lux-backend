module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'clase_profesor',
    {
      id_clase:            { type: DataTypes.INTEGER, primaryKey: true },
      id_usuario_profesor: { type: DataTypes.INTEGER, primaryKey: true },
      rol:                 { type: DataTypes.STRING(20) }
    },
    {
      tableName: 'clase_profesor',
      timestamps: false
    }
  );
};
