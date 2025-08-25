module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'horario_materia',
    {
      id:                           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_materia_plan_ciclo_lectivo:{ type: DataTypes.INTEGER },
      dia_semana:                   { type: DataTypes.INTEGER }, // 1=Lunes … 5=Viernes
      bloque:                       { type: DataTypes.INTEGER } // 1=18:20-20:20, 2=20:30-22:30
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
