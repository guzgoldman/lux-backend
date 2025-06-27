module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'profesor_materia',
    {
      id:                           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario_profesor:          { type: DataTypes.INTEGER, allowNull: false },
      id_materia_plan_ciclo_lectivo:{ type: DataTypes.INTEGER, allowNull: false },
      rol:                          { type: DataTypes.STRING(20) }
    },
    {
      tableName: 'profesor_materia',
      timestamps: false
    }
  );
};
