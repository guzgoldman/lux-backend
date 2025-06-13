// models/rol.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'rol',
    {
      id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre:  { type: DataTypes.STRING(50), unique: true, allowNull: false, comment: 'Profesor, Alumno o Administrador' }
    },
    {
      tableName: 'rol',
      timestamps: false
    }
  );
};
