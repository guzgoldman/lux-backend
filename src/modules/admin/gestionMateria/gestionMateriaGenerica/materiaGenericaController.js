const { Materia, MateriaPlan, PlanEstudio, Carrera } = require('../../../../models');
const { Op, fn, col, where } = require('sequelize');

exports.registrarMateria = async (req, res, next) => {
  const { nombre } = req.body;

  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
  }

  try {
    const existente = await Materia.findOne({
      where: where(
        fn('lower', col('nombre')),
        nombre.trim().toLowerCase()
      )
    });

    if (existente) {
      return res.status(409).json({ error: 'Ya existe una materia con ese nombre.' });
    }

    const nuevaMateria = await Materia.create({ nombre: nombre.trim() });
    return res.status(201).json(nuevaMateria);
  } catch (err) {
    next(err);
  }
};

exports.listarMaterias = async (req, res, next) => {
  try {
    const materias = await Materia.findAll({
      order: [['nombre', 'ASC']],
      include: [
        {
          model: MateriaPlan,
          as: "materiaPlans",
          include: [
            {
              model: PlanEstudio,
              as: "planEstudio",
              include: [
                {
                  model: Carrera,
                  as: "carrera"
                }
              ]
            }
          ]
        }
      ]
    });

    const resultado = materias.map(m => ({
      id: m.id,
      nombre: m.nombre,
      activa: m.activa,
      plan_estudio: (m.MateriaPlans || []).map(mp => mp.PlanEstudio ? {
        id: mp.PlanEstudio.id,
        nombre: mp.PlanEstudio.nombre
      } : null).filter(x => x !== null),
      carrera: Array.from(new Set(
        (m.MateriaPlans || [])
          .map(mp => mp.PlanEstudio?.Carrera)
          .filter(c => c)
          .map(c => `${c.id}::${c.nombre}`)
      )).map(str => {
        const [id, nombre] = str.split('::');
        return { id: +id, nombre };
      })
    }));

    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

exports.editarMateria = async (req, res, next) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const materia = await Materia.findByPk(id);
    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    materia.nombre = nombre || materia.nombre;
    await materia.save();

    res.status(200).json(materia);
  } catch (err) {
    next(err);
  }
}