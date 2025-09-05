'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('preinscripcion_estado', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      abierta: {
        type: Sequelize.TINYINT,
        allowNull: true
      }
    });
    
    // Insertar el registro inicial
    await queryInterface.bulkInsert('preinscripcion_estado', [{
      id: 1,
      abierta: 0  // Empezar con preinscripciones cerradas
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('preinscripcion_estado');
  }
};
