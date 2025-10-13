'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    
    // Primero, cambiar el tipo de columna a ENUM
    await queryInterface.changeColumn('inscripcion_materia', 'estado', {
      type: DataTypes.ENUM('Cursando', 'Regularizada', 'Aprobada', 'Desaprobada'),
      allowNull: false,
      defaultValue: 'Cursando'
    });

    // Actualizar los registros existentes para mapear los valores antiguos a los nuevos
    await queryInterface.sequelize.query(`
      UPDATE inscripcion_materia 
      SET estado = CASE 
        WHEN estado = 'Inscripto' THEN 'Cursando'
        WHEN estado = 'Aprobado' OR estado = 'Aprobada' THEN 'Aprobada'
        WHEN estado = 'Desaprobado' OR estado = 'Desaprobada' THEN 'Desaprobada'
        ELSE 'Cursando'
      END
    `);
  },

  down: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    
    // Revertir a STRING
    await queryInterface.changeColumn('inscripcion_materia', 'estado', {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Inscripto'
    });

    // Mapear de vuelta a los valores originales
    await queryInterface.sequelize.query(`
      UPDATE inscripcion_materia 
      SET estado = CASE 
        WHEN estado = 'cursando' THEN 'Inscripto'
        WHEN estado = 'aprobada' THEN 'Aprobado'
        WHEN estado = 'desaprobada' THEN 'Desaprobado'
        WHEN estado = 'regularizada' THEN 'Inscripto'
        ELSE 'Inscripto'
      END
    `);
  }
};