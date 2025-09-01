module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "persona",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(50), allowNull: false },
      apellido: { type: DataTypes.STRING(50), allowNull: false },
      sexo: { type: DataTypes.STRING(1), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false },
      dni: { type: DataTypes.STRING(10), allowNull: false },
      telefono: { type: DataTypes.STRING(15), allowNull: false },
      fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: false },
      nacionalidad: { type: DataTypes.STRING(10), allowNull: false },
      fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "persona",
      timestamps: false,
      indexes: [{ unique: true, fields: ["dni", "email"] }],
    }
  );
};
