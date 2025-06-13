// models/horario_materia.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'horario_materia',
    {
      id:                           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_materia_plan_ciclo_lectivo:{ type: DataTypes.INTEGER },
      aula:                         { type: DataTypes.STRING(20) },
      modalidad:                    { type: DataTypes.STRING(20) },
      dia_semana:                   { type: DataTypes.INTEGER }, // 1=Lunes … 5=Viernes
      bloque:                       { type: DataTypes.STRING(10) } // PRIMERO, SEGUNDO
    },
    {
      tableName: 'horario_materia',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_materia_plan_ciclo_lectivo', 'dia_semana', 'bloque'] }
      ]
    }
  );
};
