module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "tipo_materia",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.STRING(50), allowNull: false },
    },
    {
      tableName: "tipo_materia",
      timestamps: false,
    }
  );
};
