module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'alerta',
    {
      id:                       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario_administrador: { type: DataTypes.INTEGER, allowNull: false },
      titulo:                   { type: DataTypes.STRING(100), allowNull: false },
      mensaje:                  { type: DataTypes.TEXT, allowNull: false },
      fecha_creacion:           { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
      fecha_vencimiento:        { type: DataTypes.DATE },
      estado:                   { type: DataTypes.STRING(10), allowNull: false }
    },
    {
      tableName: 'alerta',
      timestamps: false,
      indexes: [
        { fields: ['fecha_creacion'] },
        { fields: ['fecha_vencimiento'] }
      ]
    }
  );
};
