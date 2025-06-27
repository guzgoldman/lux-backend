module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'carrera',
    {
      id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre:     { type: DataTypes.STRING(100), unique: true },
      duracion:   { type: DataTypes.DECIMAL(3,1), allowNull: false }
    },
    {
      tableName: 'carrera',
      timestamps: false
    }
  );
};
