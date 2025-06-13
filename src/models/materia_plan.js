// models/materia_plan.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'materia_plan',
    {
      id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_materia:       { type: DataTypes.INTEGER },
      id_plan_estudio:  { type: DataTypes.INTEGER },
      horas_catedra:    { type: DataTypes.INTEGER, allowNull: false },
      duracion:         { type: DataTypes.STRING(10), allowNull: false }, // Semestral|Anual
      anio_carrera:     { type: DataTypes.INTEGER, allowNull: false },
      descripcion:      { type: DataTypes.TEXT }
    },
    {
      tableName: 'materia_plan',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_materia', 'id_plan_estudio'] }
      ]
    }
  );
};
