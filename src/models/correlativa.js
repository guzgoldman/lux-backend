module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'correlativa',
    {
      id_materia_plan:             { type: DataTypes.INTEGER, primaryKey: true },
      id_materia_plan_correlativa: { type: DataTypes.INTEGER, primaryKey: true }
    },
    {
      tableName: 'correlativa',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_materia_plan', 'id_materia_plan_correlativa'] }
      ]
    }
  );
};
