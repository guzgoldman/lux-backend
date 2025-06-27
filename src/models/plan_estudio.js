module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'plan_estudio',
    {
      id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_carrera:         { type: DataTypes.INTEGER, allowNull: false },
      resolucion:         { type: DataTypes.STRING(30), allowNull: false },
      anio_implementacion:{ type: DataTypes.INTEGER, allowNull: false },
      vigente:            { type: DataTypes.TINYINT, defaultValue: 1 }
    },
    {
      tableName: 'plan_estudio',
      timestamps: false
    }
  );
};
