module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'certificado',
    {
      id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario_alumno: { type: DataTypes.INTEGER, allowNull: false },
      tipo:              { type: DataTypes.STRING(50), allowNull: false },
      fecha_emision:     { type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    },
    {
      tableName: 'certificado',
      timestamps: false,
      indexes: [
        { fields: ['fecha_emision'] }
      ]
    }
  );
};
