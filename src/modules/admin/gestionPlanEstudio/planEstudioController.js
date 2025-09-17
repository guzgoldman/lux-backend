const {
    PlanEstudio,
    Carrera,
    Persona,
    AlumnoCarrera,
    Usuario
} = require('../../../models');

exports.registrarPlanEstudio = async (req, res, next) => {
  const { carreraId } = req.params;
  const { resolucion, anio_implementacion } = req.body;

  try {
    const carrera = await Carrera.findByPk(carreraId);
    if (!carrera) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    const nuevoPlanEstudio = await PlanEstudio.create({
      id_carrera: carrera.id,
      resolucion,
      anio_implementacion
    });

    res.status(201).json(nuevoPlanEstudio);
  } catch (err) {
    next(err);
  }
}

exports.listarPlanesEstudio = async (req, res, next) => {
  try {
    const planesEstudio = await PlanEstudio.findAll({
      include: [{ model: Carrera, as: 'carrera' }]
    });
    res.status(200).json(planesEstudio);
  } catch (err) {
    next(err);
  }
}

exports.modificarPlanEstudio = async (req, res, next) => {
    const { planEstudioId } = req.params;
    const { carrera, resolucion, anio_implementacion } = req.body;
    
    try {
        const planEstudio = await PlanEstudio.findByPk(planEstudioId);
        if (!planEstudio) {
        return res.status(404).json({ error: 'Plan de estudio no encontrado' });
        }

        planEstudio.carrera = carrera || planEstudio.carrera;
        planEstudio.resolucion = resolucion || planEstudio.resolucion;
        planEstudio.anio_implementacion = anio_implementacion || planEstudio.anio_implementacion;
        await planEstudio.save();
    
        res.status(200).json(planEstudio);
    } catch (err) {
        next(err);
    }
}

exports.cambiarEstadoPlanEstudio = async (req, res, next) => {
    const { planEstudioId } = req.params;
    const { vigente } = req.body;

    try {
        const planEstudio = await PlanEstudio.findByPk(planEstudioId);
        if (!planEstudio) {
            return res.status(404).json({ error: 'Plan de estudio no encontrado' });
        }

        planEstudio.vigente = vigente;
        await planEstudio.save();

        res.status(200).json(planEstudio);
    } catch (err) {
        next(err);
    }
}

exports.obtenerPlanEstudioAlumno = async (req, res, next) => {
  const idUsuario = req.user.id;

  try {
    const planAlumno = await Usuario.findByPk(idUsuario, {
      attributes: ["id", "id_persona"],
      include: {
        model: Persona,
        as: "persona",
        attributes: ["id"],
        include: {
          model: AlumnoCarrera,
          as: "carreras",
          attributes: ["id_plan_estudio_asignado", "activo"],
          where: { activo: 1 }
        }
      }
    });
    const planAsignado = planAlumno?.persona?.carreras?.[0]?.id_plan_estudio_asignado;

    res.status(200).json({ planAsignado });
  } catch (err) {
    console.error('Error completo:', err);
    next(err);
  }
};