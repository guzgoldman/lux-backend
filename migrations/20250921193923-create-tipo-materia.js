"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla tipo_materia
    await queryInterface.createTable("tipo_materia", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      descripcion: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    });

    // Agregar columna en materia
    await queryInterface.addColumn("materia", "id_tipo_materia", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tipo_materia",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("materia", "id_tipo_materia");
    await queryInterface.dropTable("tipo_materia");
  },
};
