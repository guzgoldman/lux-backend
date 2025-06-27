module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'alumno_tipo',
    {
      id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(50), unique: true, allowNull: false}
    },
    {
      tableName: 'alumno_tipo',
      timestamps: false
    }
  );
};
