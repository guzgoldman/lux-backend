// models/direccion.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'direccion',
    {
      id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      calle:     { type: DataTypes.STRING(150), allowNull: false },
      altura:    { type: DataTypes.STRING(20),  allowNull: false, comment: 'Una altura no es solamente numérica, puede ser un Kilometro o S/N' },
      localidad: { type: DataTypes.STRING(100), allowNull: false },
      id_persona:{ type: DataTypes.INTEGER,     allowNull: false }
    },
    {
      tableName: 'direccion',
      timestamps: false
    }
  );
};
