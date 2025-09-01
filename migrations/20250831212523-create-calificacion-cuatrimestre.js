'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calificacion_cuatrimestre', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_inscripcion_materia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inscripcion_materia', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      cuatrimestre: {
        type: Sequelize.TINYINT, // 1 ó 2
        allowNull: false,
      },
      calificacion: {
        type: Sequelize.TINYINT, // 1..10 (entero)
        allowNull: false,
      },
      bloqueada: {
        type: Sequelize.BOOLEAN, // TINYINT(1)
        allowNull: false,
        defaultValue: false,
      },
      // Si querés timestamps:
      // fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      // fecha_modificacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    // Índice único compuesto (una calificación por cuatrimestre por inscripción)
    await queryInterface.addIndex('calificacion_cuatrimestre',
      ['id_inscripcion_materia', 'cuatrimestre'],
      { name: 'uk_calif_insc_cuatr', unique: true }
    );

    // Índice auxiliar para búsquedas por inscripción
    await queryInterface.addIndex('calificacion_cuatrimestre',
      ['id_inscripcion_materia'],
      { name: 'ix_calif_insc' }
    );

    // (Opcional) CHECK de rango si tu MySQL lo soporta:
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE `calificacion_cuatrimestre` ADD CONSTRAINT `ck_cuatr_12` CHECK (cuatrimestre in (1,2))'
    // );
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE `calificacion_cuatrimestre` ADD CONSTRAINT `ck_nota_1_10` CHECK (calificacion between 1 and 10)'
    // );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calificacion_cuatrimestre');
  }
};
