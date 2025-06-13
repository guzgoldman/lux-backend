// models/alumno_tipo.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'alumno_tipo',
    {
      id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false, comment:'Regular, Oyente, Regular de intercambio' }
    },
    {
      tableName: 'alumno_tipo',
      timestamps: false
    }
  );
};
