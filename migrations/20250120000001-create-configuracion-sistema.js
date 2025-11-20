"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla configuracion_sistema
    await queryInterface.createTable("configuracion_sistema", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        defaultValue: 1,
      },
      preinscripciones_abiertas: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      inscripciones_materias_abiertas: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      inscripciones_finales_abiertas: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
    });

    // Insertar registro inicial
    await queryInterface.bulkInsert("configuracion_sistema", [
      {
        id: 1,
        preinscripciones_abiertas: 0,
        inscripciones_materias_abiertas: 0,
        inscripciones_finales_abiertas: 0,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("configuracion_sistema");
  },
};
