module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "calificacion_cuatrimestre",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_inscripcion_materia: { type: DataTypes.INTEGER, allowNull: false },
      cuatrimestre: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 2 },
      },
      calificacion: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 10 } },
      bloqueada: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "calificacion_cuatrimestre",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["id_inscripcion_materia", "cuatrimestre"] },
        { fields: ['id_inscripcion_materia'] },
      ],
    }
  );
};
