module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'clase',
    {
      id:                           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_materia_plan_ciclo_lectivo:{ type: DataTypes.INTEGER, allowNull: false },
      fecha:                        { type: DataTypes.DATE, allowNull: false }
    },
    {
      tableName: 'clase',
      timestamps: false,
      indexes: [
        { fields: ['fecha'] }
      ]
    }
  );
};
