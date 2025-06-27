// models/rol.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'rol',
    {
      id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre:  { type: DataTypes.STRING(50), unique: true, allowNull: false}
    },
    {
      tableName: 'rol',
      timestamps: false
    }
  );
};
