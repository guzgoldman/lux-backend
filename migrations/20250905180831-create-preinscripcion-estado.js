'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('preinscripcion_estado', {
      abierta: {
        type: Sequelize.TINYINT,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('preinscripcion_estado');
  }
};