require("dotenv").config();
const app = require("./src/config/app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();

    require("./src/workers/email.worker");

    if (process.env.NODE_ENV !== "production") {
      const { createBullBoard } = require("@bull-board/api");
      const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
      const { ExpressAdapter } = require("@bull-board/express");
      const { emailQueue } = require("./src/queues/email.queue");

      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath("/admin/queues");

      createBullBoard({
        queues: [new BullMQAdapter(emailQueue)],
        serverAdapter: serverAdapter,
      });

      app.use("/admin/queues", serverAdapter.getRouter());
      console.log(
        "Bull Board disponible en http://localhost:3000/admin/queues"
      );
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Error al inicializar la DB o el servidor:", err);
    process.exit(1);
  }
}

start();
