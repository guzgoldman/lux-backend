const { ConfiguracionSistema } = require("../../../models");

exports.obtenerConfiguracionPublica = async (req, res, next) => {
  try {
    let configuracion = await ConfiguracionSistema.findByPk(1);

    // Si no existe, crear registro inicial
    if (!configuracion) {
      configuracion = await ConfiguracionSistema.create({
        id: 1,
        preinscripciones_abiertas: 0,
        inscripciones_materias_abiertas: 0,
        inscripciones_finales_abiertas: 0,
      });
    }

    res.status(200).json({
      inscripciones_materias_abiertas: configuracion.inscripciones_materias_abiertas,
      inscripciones_finales_abiertas: configuracion.inscripciones_finales_abiertas,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerConfiguracion = async (req, res, next) => {
  try {
    let configuracion = await ConfiguracionSistema.findByPk(1);

    // Si no existe, crear registro inicial
    if (!configuracion) {
      configuracion = await ConfiguracionSistema.create({
        id: 1,
        preinscripciones_abiertas: 0,
        inscripciones_materias_abiertas: 0,
        inscripciones_finales_abiertas: 0,
      });
    }

    res.status(200).json({
      preinscripciones_abiertas: configuracion.preinscripciones_abiertas,
      inscripciones_materias_abiertas: configuracion.inscripciones_materias_abiertas,
      inscripciones_finales_abiertas: configuracion.inscripciones_finales_abiertas,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleInscripcionesMaterias = async (req, res, next) => {
  try {
    const configuracion = await ConfiguracionSistema.findByPk(1);

    if (!configuracion) {
      return res.status(404).json({
        error: "Configuración no encontrada",
      });
    }

    const nuevoEstado = configuracion.inscripciones_materias_abiertas ? 0 : 1;

    await configuracion.update({ inscripciones_materias_abiertas: nuevoEstado });

    res.status(200).json({
      message: `Inscripciones a materias ${nuevoEstado ? "abiertas" : "cerradas"}`,
      inscripciones_materias_abiertas: nuevoEstado,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleInscripcionesFinales = async (req, res, next) => {
  try {
    const configuracion = await ConfiguracionSistema.findByPk(1);

    if (!configuracion) {
      return res.status(404).json({
        error: "Configuración no encontrada",
      });
    }

    const nuevoEstado = configuracion.inscripciones_finales_abiertas ? 0 : 1;

    await configuracion.update({ inscripciones_finales_abiertas: nuevoEstado });

    res.status(200).json({
      message: `Inscripciones a exámenes finales ${nuevoEstado ? "abiertas" : "cerradas"}`,
      inscripciones_finales_abiertas: nuevoEstado,
    });
  } catch (error) {
    next(error);
  }
};

exports.togglePreinscripciones = async (req, res, next) => {
  try {
    const configuracion = await ConfiguracionSistema.findByPk(1);

    if (!configuracion) {
      return res.status(404).json({
        error: "Configuración no encontrada",
      });
    }

    const nuevoEstado = configuracion.preinscripciones_abiertas ? 0 : 1;

    await configuracion.update({ preinscripciones_abiertas: nuevoEstado });

    res.status(200).json({
      message: `Preinscripciones ${nuevoEstado ? "abiertas" : "cerradas"}`,
      preinscripciones_abiertas: nuevoEstado,
    });
  } catch (error) {
    next(error);
  }
};
