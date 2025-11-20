module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'configuracion_sistema',
    {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        defaultValue: 1
      },
      preinscripciones_abiertas: { 
        type: DataTypes.TINYINT, 
        defaultValue: 0,
        allowNull: false 
      },
      inscripciones_materias_abiertas: { 
        type: DataTypes.TINYINT, 
        defaultValue: 0,
        allowNull: false 
      },
      inscripciones_finales_abiertas: { 
        type: DataTypes.TINYINT, 
        defaultValue: 0,
        allowNull: false 
      }
    },
    {
      tableName: 'configuracion_sistema',
      timestamps: false
    }
  );
};
