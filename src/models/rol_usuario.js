module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'rol_usuario',
    {
      id_usuario: { type: DataTypes.INTEGER, primaryKey: true },
      id_rol:     { type: DataTypes.INTEGER, primaryKey: true }
    },
    {
      tableName: 'rol_usuario',
      timestamps: false,
      indexes: [
        { unique: true, fields: ['id_usuario', 'id_rol'] }
      ]
    }
  );
};
