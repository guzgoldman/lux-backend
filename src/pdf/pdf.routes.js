const express = require("express");
const dayjs = require("dayjs");
require("dayjs/locale/es");
const { generarConstanciaAlumnoRegular, renderConstanciaHTML } = require("./pdf.service"); // ver nota más abajo
const { verifyToken } = require("../middlewares/auth");
const {
  Usuario,
  Persona,
  Carrera,
  AlumnoCarrera,
  Certificado,
  PlanEstudio,
} = require("../models");
dayjs.locale("es");
const router = express.Router();
const { Op } = require("sequelize");

router.get(
  "/constancia-alumno-regular/:idAlumno",
  verifyToken,
  async (req, res, next) => {
    try {
      const { idAlumno } = req.params;

      const alumno = await Usuario.findByPk(idAlumno, {
        include: [
          {
            model: Persona,
            as: "persona",
            attributes: ["nombre", "apellido", "dni"],
          },
        ],
      });

      if (!alumno)
        return res.status(404).json({ error: "Alumno no encontrado" });

      const carrerasActivas = await AlumnoCarrera.findAll({
        where: {
          id_persona: alumno.id_persona,
          activo: { [Op.or]: [true, 1] },
        },
        include: [
          {
            model: Carrera,
            as: "carrera",
            attributes: ["nombre"],
            required: true,
            include: [
              {
                model: PlanEstudio,
                as: "planesEstudio",
                attributes: ["resolucion"],
                required: false,
              },
            ],
          },
        ],
      });

      if (carrerasActivas.length === 0) {
        return res
          .status(400)
          .json({ error: "El alumno no está activo en ninguna carrera" });
      }

      const contacto =
        "terciario@lujanbuenviaje.edu.ar — www.lujanbuenviaje.edu.ar";
      const sitio = "www.lujanbuenviaje.edu.ar";
      const email = "terciario@lujanbuenviaje.edu.ar";

      const hoy = dayjs();

      const carrerasInfo = carrerasActivas.map((c) => ({
        nombre: c.carrera?.nombre,
        resolucion: c.carrera?.planesEstudio?.[0]?.resolucion ?? "—",
      }));

      const data = {
        nombre: alumno.persona.nombre,
        apellido: alumno.persona.apellido,
        dni: alumno.persona.dni,
        carreras: carrerasInfo,
        contacto,
        sitio,
        email,
        dia: hoy.format("D"),
        mes: hoy.format("MMMM"),
        anio: hoy.format("YYYY"),
      };

      await Certificado.create({
        id_usuario_alumno: idAlumno,
        tipo: "ALUMNO_REGULAR",
        fecha_emision: new Date(),
      });

      if (req.query.format === "html") {
        const html = renderConstanciaHTML(data);
        return res
          .status(200)
          .set("Content-Type", "text/html; charset=utf-8")
          .send(
            `${html}<script>setTimeout(()=>{try{window.print()}catch(e){}}, 300)</script>`
          );
      }

      const pdf = await generarConstanciaAlumnoRegular(data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="constancia_${data.apellido}_${data.dni}.pdf"`
      );
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition"); // CAMBIO: útil si luego querés leer filename desde XHR
      res.send(pdf);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
