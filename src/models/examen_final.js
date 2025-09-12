module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'examen_final',
    {
      id:                           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_materia_plan:              { type: DataTypes.INTEGER, allowNull: false },
      fecha:                        { type: DataTypes.DATE },
      estado:                       { type: DataTypes.STRING(20), defaultValue: 'PENDIENTE' },
      id_usuario_profesor:          { type: DataTypes.INTEGER, allowNull: false },
      creado_por:                   { type: DataTypes.INTEGER, allowNull: false },
      fecha_creacion:               { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      modificado_por:               { type: DataTypes.INTEGER },
      fecha_modificacion: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate:    sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'examen_final',
      timestamps: false,
      indexes: [
        { fields: ['fecha'] }
      ]
    }
  );
};
