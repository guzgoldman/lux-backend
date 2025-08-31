module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "alumno_carrera",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_persona: { type: DataTypes.INTEGER, allowNull: false },
      id_carrera: { type: DataTypes.INTEGER, allowNull: false },
      fecha_inscripcion: {
        type: DataTypes.DATEONLY,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      activo: { type: DataTypes.TINYINT, defaultValue: 1 },
      //egresado: { type: DataTypes.TINYINT, defaultValue: 0 },
    },
    {
      tableName: "alumno_carrera",
      timestamps: false,
      indexes: [
        {
          name: "uniq_persona_carrera",
          unique: true,
          fields: ["id_persona", "id_carrera"],
        },
      ],
    }
  );
};
