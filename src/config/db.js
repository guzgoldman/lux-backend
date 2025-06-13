// src/config/database.js
const dotenv       = require('dotenv');
const { Sequelize } = require('sequelize');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // nombre de la base
  process.env.DB_USER,      // usuario
  process.env.DB_PASSWORD,  // contraseña
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,         // setea a console.log si querés ver las queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;