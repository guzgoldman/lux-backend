module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'evaluacion_tipo',
    {
      id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      codigo:     { type: DataTypes.STRING(5),  allowNull: false, unique: true }, // P1, R1, ...
      descripcion:{ type: DataTypes.STRING(100), allowNull: false }
    },
    {
      tableName: 'evaluacion_tipo',
      timestamps: false
    }
  );
};
