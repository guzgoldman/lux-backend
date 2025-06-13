// models/materia.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'materia',
    {
      id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(50), allowNull: false }
    },
    {
      tableName: 'materia',
      timestamps: false
    }
  );
};
