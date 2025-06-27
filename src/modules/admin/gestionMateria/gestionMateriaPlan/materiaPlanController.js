const {
    Materia,
    MateriaPlan,
    PlanEstudio
} = require('../../../../models');

exports.registrarMateriaPlan = async (req, res, next) => {
    const { planEstudioId } = req.params;
    const { materiaGenericaNombre, horasCatedra, duracion, anioCarrera } = req.body;
    
    try {
        const planEstudio = await PlanEstudio.findByPk(planEstudioId);
        const materiaGenerica = await Materia.findOne({ 
            where: {nombre: materiaGenericaNombre} 
        });
        if (!materiaGenerica) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }
        if (!planEstudio) {
            return res.status(404).json({ error: 'Plan de estudio no encontrado' });
        }
    
        const nuevaMateriaPlan = await MateriaPlan.create({
            id_materia: materiaGenerica.id,
            id_plan_estudio: planEstudio.id,
            horas_catedra: horasCatedra,
            duracion: duracion,
            anio_carrera: anioCarrera
        });
    
        res.status(201).json(nuevaMateriaPlan);
    } catch (err) {
        next(err);
    }
}

exports.listarMateriasPlan = async (req, res, next) => {
    const { planEstudioId } = req.params;

    try {
        const materiasPlan = await MateriaPlan.findAll({ 
            where: { id_plan_estudio: planEstudioId },
            // Incluir el nombre de la materia asociada
            include: [{ model: Materia, as: 'materia' }]
        });
        res.status(200).json(materiasPlan);
    } catch (err) {
        next(err);
    }
}

exports.modificarMateriaPlan = async (req, res, next) => {
    const { materiaPlanId } = req.params;
    const { horasCatedra, duracion, anioCarrera } = req.body;

    try {
        const materiaPlan = await MateriaPlan.findByPk(materiaPlanId);
        if (!materiaPlan) {
            return res.status(404).json({ error: 'Materia del plan no encontrada' });
        }

        materiaPlan.horas_catedra = horasCatedra || materiaPlan.horas_catedra;
        materiaPlan.duracion = duracion || materiaPlan.duracion;
        materiaPlan.anio_carrera = anioCarrera || materiaPlan.anio_carrera;
        await materiaPlan.save();

        res.status(200).json(materiaPlan);
    } catch (err) {
        next(err);
    }
}