module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'materia_plan_ciclo_lectivo',
    {
      id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_materia_plan:   { type: DataTypes.INTEGER, allowNull: false },
      ciclo_lectivo:     { type: DataTypes.INTEGER, allowNull: false },
      fecha_inicio:      { type: DataTypes.DATEONLY },
      fecha_cierre:      { type: DataTypes.DATEONLY },
      tipo_aprobacion:   { type: DataTypes.ENUM('EP', 'P', 'NP'), allowNull: false, defaultValue: 'P' }
    },
    {
      tableName: 'materia_plan_ciclo_lectivo',
      timestamps: false,
      indexes: [
        { fields: ['ciclo_lectivo'] },
        { unique: true, fields: ['id_materia_plan', 'ciclo_lectivo'] }
      ]
    }
  );
};
