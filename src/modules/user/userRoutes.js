const express = require("express");
const router = express.Router();
const { perfil } = require("./userController");
const { verifyToken, requireRole } = require("../../middlewares/auth");

router.get("/perfil", verifyToken, perfil);

router.get("/perfil/:id", verifyToken, requireRole("Administrador"), perfil);

module.exports = router;
