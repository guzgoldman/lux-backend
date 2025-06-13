// models/preinscripcion.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('preinscripcion', {
        id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_persona:    { type: DataTypes.INTEGER, allowNull: false },
        id_carrera:    { type: DataTypes.INTEGER, allowNull: false },
        fecha_creacion:{ type: DataTypes.DATE, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        estado:        { type: DataTypes.ENUM('Pendiente','Aprobada','Rechazada'), defaultValue: 'Pendiente' },
        visible:       { type: DataTypes.TINYINT, defaultValue: 1 },
        comentario:    { type: DataTypes.TEXT }
    }, { tableName: 'preinscripcion', timestamps: false });
}