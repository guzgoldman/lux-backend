// server.js
require('dotenv').config();
const app           = require('./src/config/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');

    // 2) Crear/Actualizar tablas según tus modelos
    // - force: true  => borra y vuelve a crear TODAS las tablas
    // - alter: true  => modifica las tablas para adaptarlas a los modelos
    await sequelize.sync({ alter: true });
    
    // 3) Levantar Express
    app.listen(PORT, () => {
      console.log(`🚀 Server corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al inicializar la DB o el servidor:', err);
    process.exit(1);
  }
}

start();
