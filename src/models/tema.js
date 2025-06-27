module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'tema',
    {
      id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      descripcion: { type: DataTypes.TEXT, allowNull: false }
    },
    {
      tableName: 'tema',
      timestamps: false
    }
  );
};
