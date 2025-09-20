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
    // Obtener todas las carreras activas del alumno junto con el plan asignado y datos de la carrera
    const usuarioConCarreras = await Usuario.findByPk(idUsuario, {
      attributes: ["id", "id_persona"],
      include: {
        model: Persona,
        as: "persona",
        attributes: ["id"],
        include: {
          model: AlumnoCarrera,
          as: "carreras",
          attributes: ["id", "id_plan_estudio_asignado", "id_carrera", "activo"],
          where: { activo: 1 },
          include: [
            {
              model: PlanEstudio,
              as: 'planEstudio',
              attributes: ['id', 'resolucion', 'anio_implementacion', 'vigente'],
              required: false
            },
            {
              model: Carrera,
              as: 'carrera',
              attributes: ['id', 'nombre'],
              required: false
            }
          ]
        }
      }
    });

    const carreras = (usuarioConCarreras?.persona?.carreras || []).map((ac) => ({
      id: ac.id,
      idCarrera: ac.id_carrera,
      activo: ac.activo,
      idPlanAsignado: ac.id_plan_estudio_asignado,
      plan: ac.planEstudio || null,
      carrera: ac.carrera || null
    }));

    res.status(200).json({ carreras });
  } catch (err) {
    console.error('Error completo:', err);
    next(err);
  }
};