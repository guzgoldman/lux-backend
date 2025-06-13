// models/clase_tema.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'clase_tema',
    {
      id_clase: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      id_tema:  { type: DataTypes.INTEGER, primaryKey: true, allowNull: false }
    },
    {
      tableName: 'clase_tema',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_clase', 'id_tema'] }
      ]
    }
  );
};
