module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'usuario',
    {
      id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username:     { type: DataTypes.STRING(30), unique: true, allowNull: false },
      id_persona:   { type: DataTypes.INTEGER },
      password:     { type: DataTypes.STRING(255), allowNull: false },
      fecha_creacion:{type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    },
    {
      tableName: 'usuario',
      timestamps: false
    }
  );
};
