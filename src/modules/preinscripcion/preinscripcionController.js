const {
  sequelize,
  Persona,
  Direccion,
  Preinscripcion,
  Carrera,
  PreinscripcionEstado,
} = require("../../models");

exports.createPreinscripcion = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const estado = await PreinscripcionEstado.findByPk(1);
    if (!estado || estado.abierta === 0) {
      await t.rollback();
      return res.status(403).json({
        error: "Las preinscripciones están actualmente cerradas",
      });
    }

    let persona = await Persona.findOne({
      where: { dni: req.body.numeroDocumento },
      transaction: t,
    });

    if (!persona) {
      persona = await Persona.create(
        {
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          sexo: req.body.sexo,
          dni: req.body.numeroDocumento,
          email: req.body.email,
          telefono: req.body.telefono,
          fecha_nacimiento: req.body.fechaNacimiento,
        },
        { transaction: t }
      );

      await Direccion.create(
        {
          calle: req.body.calle,
          altura: req.body.altura,
          localidad: req.body.localidad,
          id_persona: persona.id,
        },
        { transaction: t }
      );
    }

    const preinscripcion = await Preinscripcion.create(
      {
        id_persona: persona.id,
        id_carrera: req.body.carrera,
        comentario: req.body.observaciones,
      },
      { transaction: t }
    );

    const carrera = await Carrera.findByPk(req.body.carrera);

    await t.commit();

    let fechaHora =
      preinscripcion.createdAt || preinscripcion.fecha_creacion || Date.now();

    fechaHora = new Date(fechaHora);
    if (isNaN(fechaHora.getTime())) fechaHora = new Date();

    const registrationNumber = `PR-${String(preinscripcion.id).padStart(
      5,
      "0"
    )}`;

    const submissionDate = fechaHora.toLocaleDateString("es-AR");
    const submissionTime = fechaHora.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    res.status(201).json({
      message: "Preinscripción recibida",
      registrationNumber,
      submissionDate,
      submissionTime,
      studentData: {
        career: carrera ? carrera.nombre : req.body.carrera,
        email: persona.email,
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getEstadoPreinscripcion = async (req, res, next) => {
  try {
    const estado = await PreinscripcionEstado.findByPk(1);

    res.status(200).json({
      abierta: estado ? estado.abierta : 0,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleEstadoPreinscripcion = async (req, res, next) => {
  try {
    const estado = await PreinscripcionEstado.findByPk(1);

    const nuevoEstado = estado.abierta ? 0 : 1;

    await estado.update({ abierta: nuevoEstado });

    res.status(200).json({
      message: `Preinscripciones ${nuevoEstado ? "abiertas" : "cerradas"}`,
      abierta: nuevoEstado,
    });
  } catch (error) {
    next(error);
  }
};
