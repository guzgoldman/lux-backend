const {
    PlanEstudio,
    Carrera
} = require('../../../models');

exports.registrarPlanEstudio = async (req, res, next) => {
  const { carreraId } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const carrera = await Carrera.findByPk(carreraId);
    if (!carrera) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    const nuevoPlanEstudio = await PlanEstudio.create({
      nombre,
      descripcion,
      id_carrera: carrera.id
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