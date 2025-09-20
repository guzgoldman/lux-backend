module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'inscripcion_materia',
    {
      id:                           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario_alumno:            { type: DataTypes.INTEGER, allowNull: false },
      id_materia_plan_ciclo_lectivo:{ type: DataTypes.INTEGER, allowNull: false },
      id_tipo_alumno:               { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1 = Regular, 2 = Libre, 3 = Oyente, 4 = Itinerante
      fecha_inscripcion:            { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      estado:                       { type: DataTypes.STRING(20), defaultValue: 'Inscripto' },
      nota_final:                   { type: DataTypes.DECIMAL(4,2) },
      fecha_finalizacion:           { type: DataTypes.DATE },
      creado_por:                   { type: DataTypes.INTEGER, allowNull: false },
      fecha_creacion:               { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      modificado_por:               { type: DataTypes.INTEGER },
      fecha_modificacion: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate:    sequelize.literal('CURRENT_TIMESTAMP')
      },
      origen_aprobacion: { type: DataTypes.ENUM('Final', 'Equivalencia', 'Convalidacion', 'Promocion'), defaultValue: 'Final' },
      id_inscripcion_examen_final_aprobatorio: { type: DataTypes.INTEGER, allowNull: true },
      id_acreditacion_equivalencia_aprobatoria: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: 'inscripcion_materia',
      timestamps: false,
      indexes: [
        {
          name: 'uniq_insc_user_mat',
          unique: true,
          fields: [
            'id_usuario_alumno',
            'id_materia_plan_ciclo_lectivo'
          ]
        },
        { fields: ['fecha_inscripcion'] }
      ]
    }
  );
};
