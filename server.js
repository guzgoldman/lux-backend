require("dotenv").config();
const app = require("./src/config/app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    // Iniciar worker de procesamiento de emails
    require('./src/workers/email.worker');
    // - force: true  => borra y vuelve a crear TODAS las tablas
    // - alter: true  => modifica las tablas para adaptarlas a los modelos
    // await sequelize.sync({ alter: true });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al inicializar la DB o el servidor:", err);
    process.exit(1);
  }
}

start();
