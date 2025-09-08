const express = require("express");
const dayjs = require("dayjs");
require("dayjs/locale/es");
const {
  generarConstanciaAlumnoRegular,
  renderConstanciaHTML,
  generarCertificadoMateriasAprobadas,
  renderCertificadoMateriasAprobadasHTML,
  generarCertificadoAsistenciaExamen,
  renderCertificadoAsistenciaExamenHTML,
} = require("./pdf.service");
const { verifyToken } = require("../middlewares/auth");
const {
  Usuario,
  Persona,
  Carrera,
  AlumnoCarrera,
  Certificado,
  PlanEstudio,
  InscripcionMateria,
  MateriaPlanCicloLectivo,
  MateriaPlan,
  Materia,
  ExamenFinal,
  AsistenciaExamenFinal,
  InscripcionExamenFinal
} = require("../models");
dayjs.locale("es");
const router = express.Router();
const { Op } = require("sequelize");

// Distribuidor principal de certificados
router.get(
  "/certificado/:certificadoId/:idAlumno",
  verifyToken,
  async (req, res, next) => {
    try {
      const { certificadoId, idAlumno } = req.params;
      const certificadoIdInt = parseInt(certificadoId);

      // Validar que el alumno existe
      const alumno = await Usuario.findByPk(idAlumno, {
        include: [
          {
            model: Persona,
            as: "persona",
            attributes: ["nombre", "apellido", "dni"],
          },
        ],
      });

      if (!alumno) {
        return res.status(404).json({ error: "Alumno no encontrado" });
      }

      // Distribuir según el tipo de certificado
      switch (certificadoIdInt) {
        case 1:
          return await procesarCertificadoAlumnoRegular(req, res, next, alumno);
        case 2:
          return await procesarCertificadoMateriasAprobadas(req, res, next, alumno);
        case 3:
          return await procesarCertificadoAsistenciaExamen(req, res, next, alumno);
        default:
          return res.status(400).json({ error: "Tipo de certificado no válido" });
      }
    } catch (e) {
      next(e);
    }
  }
);

// Función para generar Certificado de Alumno Regular (ID: 1)
async function procesarCertificadoAlumnoRegular(req, res, next, alumno) {
  try {
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

    const contacto = "terciario@lujanbuenviaje.edu.ar — www.lujanbuenviaje.edu.ar";
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
      id_usuario_alumno: alumno.id,
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
      `inline; filename="constancia_alumno_regular_${data.apellido}_${data.dni}.pdf"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}

// Función para generar Certificado de Materias Aprobadas (ID: 2)
async function procesarCertificadoMateriasAprobadas(req, res, next, alumno) {
  try {
    const materiasAprobadas = await InscripcionMateria.findAll({
      where: {
        id_usuario_alumno: alumno.id,
        estado: "APROBADA"
      },
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          include: [
            {
              model: MateriaPlan,
              as: "materiaPlan",
              include: [
                {
                  model: Materia,
                  as: "materia",
                  attributes: ["nombre"]
                },
                {
                  model: PlanEstudio,
                  as: "planEstudio",
                  attributes: ["resolucion"],
                  include: [
                    {
                      model: Carrera,
                      as: "carrera",
                      attributes: ["nombre"]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['fecha_inscripcion', 'ASC']]
    });

    const contacto = "terciario@lujanbuenviaje.edu.ar — www.lujanbuenviaje.edu.ar";
    const sitio = "www.lujanbuenviaje.edu.ar";
    const email = "terciario@lujanbuenviaje.edu.ar";
    const hoy = dayjs();

    const materiasInfo = materiasAprobadas.map((inscripcion) => ({
      nombre: inscripcion.ciclo?.materiaPlan?.materia?.nombre || "Materia no especificada",
      carrera: inscripcion.ciclo?.materiaPlan?.planEstudio?.carrera?.nombre || "Carrera no especificada",
      fechaAprobacion: inscripcion.fecha_aprobacion ? dayjs(inscripcion.fecha_aprobacion).format("DD/MM/YYYY") : "—",
      cicloLectivo: inscripcion.ciclo?.ciclo_lectivo || "—"
    }));

    const data = {
      nombre: alumno.persona.nombre,
      apellido: alumno.persona.apellido,
      dni: alumno.persona.dni,
      materias: materiasInfo,
      totalMaterias: materiasInfo.length,
      contacto,
      sitio,
      email,
      dia: hoy.format("D"),
      mes: hoy.format("MMMM"),
      anio: hoy.format("YYYY"),
    };

    await Certificado.create({
      id_usuario_alumno: alumno.id,
      tipo: "MATERIAS_APROBADAS",
      fecha_emision: new Date(),
    });

    if (req.query.format === "html") {
      const html = renderCertificadoMateriasAprobadasHTML(data);
      return res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .send(
          `${html}<script>setTimeout(()=>{try{window.print()}catch(e){}}, 300)</script>`
        );
    }

    const pdf = await generarCertificadoMateriasAprobadas(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificado_materias_aprobadas_${data.apellido}_${data.dni}.pdf"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}

// Función para generar Certificado de Asistencia a Examen (ID: 3)
async function procesarCertificadoAsistenciaExamen(req, res, next, alumno) {
  try {
    const asistenciasExamen = await AsistenciaExamenFinal.findAll({
      where: {
        id_usuario_alumno: alumno.id
      },
      include: [
        {
          model: ExamenFinal,
          as: "examenFinal",
          include: [
            {
              model: MateriaPlanCicloLectivo,
              as: "ciclo",
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                  include: [
                    {
                      model: Materia,
                      as: "materia",
                      attributes: ["nombre"]
                    },
                    {
                      model: PlanEstudio,
                      as: "planEstudio",
                      attributes: ["resolucion"],
                      include: [
                        {
                          model: Carrera,
                          as: "carrera",
                          attributes: ["nombre"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['fecha_asistencia', 'DESC']]
    });

    const contacto = "terciario@lujanbuenviaje.edu.ar — www.lujanbuenviaje.edu.ar";
    const sitio = "www.lujanbuenviaje.edu.ar";
    const email = "terciario@lujanbuenviaje.edu.ar";
    const hoy = dayjs();

    const examenesInfo = asistenciasExamen.map((asistencia) => ({
      materia: asistencia.examenFinal?.materiaPlanCiclo?.materiaPlan?.materia?.nombre || "Materia no especificada",
      carrera: asistencia.examenFinal?.materiaPlanCiclo?.materiaPlan?.planEstudio?.carrera?.nombre || "Carrera no especificada",
      fechaExamen: asistencia.fecha_asistencia ? dayjs(asistencia.fecha_asistencia).format("DD/MM/YYYY") : "—",
      llamado: asistencia.examenFinal?.llamado || "—",
      presente: asistencia.presente ? "Sí" : "No"
    }));

    const data = {
      nombre: alumno.persona.nombre,
      apellido: alumno.persona.apellido,
      dni: alumno.persona.dni,
      examenes: examenesInfo,
      totalExamenes: examenesInfo.length,
      contacto,
      sitio,
      email,
      dia: hoy.format("D"),
      mes: hoy.format("MMMM"),
      anio: hoy.format("YYYY"),
    };

    await Certificado.create({
      id_usuario_alumno: alumno.id,
      tipo: "ASISTENCIA_EXAMEN",
      fecha_emision: new Date(),
    });

    if (req.query.format === "html") {
      const html = renderCertificadoAsistenciaExamenHTML(data);
      return res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .send(
          `${html}<script>setTimeout(()=>{try{window.print()}catch(e){}}, 300)</script>`
        );
    }

    const pdf = await generarCertificadoAsistenciaExamen(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificado_asistencia_examen_${data.apellido}_${data.dni}.pdf"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}

// Mantener el endpoint original para compatibilidad
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

      return await procesarCertificadoAlumnoRegular(req, res, next, alumno);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;