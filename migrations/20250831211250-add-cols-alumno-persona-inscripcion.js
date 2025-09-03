'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {

      // ========== alumno_carrera.egresado (boolean) ==========
      // Paso A: agregar como NULL (seguro)
      await queryInterface.addColumn('alumno_carrera', 'egresado', {
        type: Sequelize.BOOLEAN,          // en MySQL se mapea a TINYINT(1)
        allowNull: true,
      }, { transaction: t });

      // Paso B: backfill a false (0) para filas existentes
      await queryInterface.sequelize.query(`
        UPDATE alumno_carrera
        SET egresado = 0
        WHERE egresado IS NULL
      `, { transaction: t });

      // Paso C: dejar NOT NULL + default
      await queryInterface.changeColumn('alumno_carrera', 'egresado', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction: t });


      // ========== inscripcion_materia.id_tipo_alumno (FK a alumno_tipo.id) ==========
      // Paso A: agregar como NULL (seguro)
      await queryInterface.addColumn('inscripcion_materia', 'id_tipo_alumno', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction: t });

      // Paso B: backfill con el tipo "Regular" (usualmente id=1)
      // Ajustá el valor si tu catálogo difiere
      await queryInterface.sequelize.query(`
        UPDATE inscripcion_materia
        SET id_tipo_alumno = 1
        WHERE id_tipo_alumno IS NULL
      `, { transaction: t });

      // Paso C: agregar la FK
      await queryInterface.addConstraint('inscripcion_materia', {
        fields: ['id_tipo_alumno'],
        type: 'foreign key',
        name: 'fk_insc_tipo_alumno',
        references: { table: 'alumno_tipo', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // o SET NULL si preferís
        transaction: t
      });

      // Paso D: dejar NOT NULL
      await queryInterface.changeColumn('inscripcion_materia', 'id_tipo_alumno', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction: t });


      // ========== persona.nacionalidad (string) ==========
      // La agrego como NULL para no forzar backfill masivo.
      await queryInterface.addColumn('persona', 'nacionalidad', {
        type: Sequelize.STRING(10),  // si en tu DBML pusiste otro largo, ajustalo
        allowNull: true,
      }, { transaction: t });

      // Si quisieras hacerla NOT NULL, primero hacé un backfill consistente:
      await queryInterface.sequelize.query(`
        UPDATE persona SET nacionalidad = 'Argentina' WHERE nacionalidad IS NULL
      `, { transaction: t });
      await queryInterface.changeColumn('persona', 'nacionalidad', {
        type: Sequelize.STRING(10),
        allowNull: false,
      }, { transaction: t });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      // Revertir en orden inverso: quitar constraints y columnas

      // persona.nacionalidad
      await queryInterface.removeColumn('persona', 'nacionalidad', { transaction: t });

      // inscripcion_materia.id_tipo_alumno (primero constraint, luego columna)
      await queryInterface.removeConstraint('inscripcion_materia', 'fk_insc_tipo_alumno', { transaction: t });
      await queryInterface.removeColumn('inscripcion_materia', 'id_tipo_alumno', { transaction: t });

      // alumno_carrera.egresado
      await queryInterface.removeColumn('alumno_carrera', 'egresado', { transaction: t });
    });
  }
};
