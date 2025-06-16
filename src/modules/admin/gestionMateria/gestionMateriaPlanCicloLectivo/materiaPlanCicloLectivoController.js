const {
    Materia,
    MateriaPlan,
    PlanEstudio,
    MateriaPlanCicloLectivo,
} = require('../../../models');

exports.registrarMateriaPlanCicloLectivo = async (req, res, next) => {
    const { materiaPlanId, cicloLectivo, fechaInicio, fechaCierre, tipoAprobacion } = req.body;

    try {
        const materiaPlan = await MateriaPlan.find({
            where: { id : materiaPlanId }
        });
        if (!materiaPlan) {
            return res.status(404).json({ error: 'Materia del plan no encontrada' });
        }

        const nuevaMateriaPlanCicloLectivo = await MateriaPlanCicloLectivo.create({
            id_materia_plan: materiaPlan.id,
            ciclo_lectivo: cicloLectivo,
            fecha_inicio: fechaInicio,
            fecha_cierre: fechaCierre,
            tipo_aprobacion: tipoAprobacion,
        });

        res.status(201).json(nuevaMateriaPlanCicloLectivo);
    } catch (err) {
        next(err);
    }
}

exports.listarMateriasPlanCicloLectivo = async (req, res, next) => {
    try {
        const materiasPlanCicloLectivo = await MateriaPlanCicloLectivo.findAll({
            include: [
                { model: MateriaPlan, as: 'materiaPlan' }, 
                { model: PlanEstudio, as: 'planEstudio' },
                { model: Materia, as: 'materia' }
            ]
        });
        res.status(200).json(materiasPlanCicloLectivo);
    } catch (err) {
        next(err);
    }
}

exports.modificarMateriaPlanCicloLectivo = async (req, res, next) => {
    const { materiaPlanCicloLectivoId, cicloLectivo, fechaInicio, fechaCierre, tipoAprobacion } = req.body;

    try {
        const materiaPlanCicloLectivo = await MateriaPlanCicloLectivo.findByPk(materiaPlanCicloLectivoId);
        if (!materiaPlanCicloLectivo) {
            return res.status(404).json({ error: 'Materia del plan ciclo lectivo no encontrada' });
        }

        materiaPlanCicloLectivo.ciclo_lectivo = cicloLectivo || materiaPlanCicloLectivo.ciclo_lectivo;
        materiaPlanCicloLectivo.fecha_inicio = fechaInicio || materiaPlanCicloLectivo.fecha_inicio;
        materiaPlanCicloLectivo.fecha_cierre = fechaCierre || materiaPlanCicloLectivo.fecha_cierre;
        materiaPlanCicloLectivo.tipo_aprobacion = tipoAprobacion || materiaPlanCicloLectivo.tipo_aprobacion;
        await materiaPlanCicloLectivo.save();

        res.status(200).json(materiaPlanCicloLectivo);
    } catch (err) {
        next(err);
    }
}

exports.buscarMateriaPlanCicloLectivoPorId = async (req, res, next) => {
    const { materiaPlanCicloLectivoId } = req.params;

    try {
        const materiaPlanCicloLectivo = await MateriaPlanCicloLectivo.findByPk(materiaPlanCicloLectivoId, {
            include: [
                { model: MateriaPlan, as: 'materiaPlan' },
                { model: PlanEstudio, as: 'planEstudio' },
                { model: Materia, as: 'materia' }
            ]
        });
        if (!materiaPlanCicloLectivo) {
            return res.status(404).json({ error: 'Materia del plan ciclo lectivo no encontrada' });
        }
        res.status(200).json(materiaPlanCicloLectivo);
    } catch (err) {
        next(err);
    }
}