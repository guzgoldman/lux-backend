const {
  Usuario,
  Persona,
  Direccion,
  InscripcionMateria,
  MateriaPlanCicloLectivo,
  Materia,
  HorarioMateria,
  Evaluacion,
  AlumnoCarrera,
  Carrera,
  Rol,
  PlanEstudio,
  MateriaPlan,
  RolUsuario
} = require("../../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

exports.perfil = async (req, res, next) => {
  try {
    const idUsuario = req.params.id || req.user.id;

    const usuario = await Usuario.findByPk(idUsuario, {
      attributes: ["id", "username"],
      include: [
        {
          model: Persona,
          as: "persona",
          attributes: [
            "nombre",
            "apellido",
            "email",
            "dni",
            "telefono",
            "fecha_nacimiento",
          ],
          include: [
            {
              model: Direccion,
              as: "direcciones",
              attributes: ["calle", "altura", "localidad"],
            },
            {
              model: AlumnoCarrera,
              as: "carreras",
              attributes: ["fecha_inscripcion", "activo", "id_tipo_alumno"],
              include: [
                {
                  model: Carrera,
                  as: "carrera",
                  attributes: ["id", "nombre"],
                  include: [
                    {
                      model: PlanEstudio,
                      as: "planesEstudio",
                      attributes: ["id", "resolucion", "vigente"],
                      where: { vigente: 1 },
                      include: [
                        {
                          model: MateriaPlan,
                          as: "materiaPlans",
                          attributes: ["id"],
                          include: [
                            {
                              model: Materia,
                              as: "materia",
                              attributes: ["id", "nombre"],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: InscripcionMateria,
          as: "inscripciones",
          attributes: ["id", "estado", "nota_final"],
          include: [
            {
              model: MateriaPlanCicloLectivo,
              as: "ciclo",
              attributes: ["id", "ciclo_lectivo"],
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                  attributes: ["id", "id_materia"],
                  include: [
                    {
                      model: Materia,
                      as: "materia",
                      attributes: ["id", "nombre"],
                    },
                  ],
                },
                {
                  model: HorarioMateria,
                  as: "horarios",
                  attributes: ["dia_semana", "bloque"],
                },
              ],
            },
            {
              model: Evaluacion,
              as: "evaluaciones",
              attributes: [
                ["nota", "nota"],
                ["id_evaluacion_tipo", "tipo"],
              ],
            },
          ],
        },
        {
          model: Rol,
          as: "roles",
          attributes: ["id", "nombre"],
        },
      ],
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const aprobadas = usuario.inscripciones.filter(
      (i) => i.estado === "Aprobada"
    ).length;
    
    // Contar materias únicas aprobadas por el alumno
    const materiasAprobadasIds = new Set();
    usuario.inscripciones
      .filter((i) => i.estado === "Aprobada")
      .forEach((i) => {
        if (i.ciclo && i.ciclo.materiaPlan && i.ciclo.materiaPlan.id_materia) {
          materiasAprobadasIds.add(i.ciclo.materiaPlan.id_materia);
        }
      });
    
    const materiasAprobadasUnicas = materiasAprobadasIds.size;
    
    const promedio =
      usuario.inscripciones
        .flatMap((i) => i.evaluaciones)
        .reduce((sum, ev) => sum + parseFloat(ev.nota), 0) /
        usuario.inscripciones.flatMap((i) => i.evaluaciones).length || 0;

    const tipoAlumnoMap = {
      1: "Regular",
      2: "Libre",
      3: "Oyente",
      4: "Itinerante",
    };

    const carreras = usuario.persona.carreras;
    let carreraActiva =
      carreras.find((c) => c.activo === 1) || carreras[0] || {};
    const idTipo = carreraActiva.id_tipo_alumno;
    
    // Obtener total de materias del plan de estudios vigente
    let totalMateriasPlan = 0;
    if (carreraActiva.carrera && carreraActiva.carrera.planesEstudio && carreraActiva.carrera.planesEstudio.length > 0) {
      const planVigente = carreraActiva.carrera.planesEstudio[0]; // Ya filtrado por vigente: 1
      totalMateriasPlan = planVigente.materiaPlans ? planVigente.materiaPlans.length : 0;
    }

    const informacionPersonal = {
      nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
      fechaNacimiento: usuario.persona.fecha_nacimiento,
      dni: usuario.persona.dni,
      ingreso: carreraActiva.fecha_inscripcion
        ? carreraActiva.fecha_inscripcion
        : null,
      condicion: tipoAlumnoMap[idTipo] || "Desconocido",
      carrera: carreras.map((c) => c.carrera.nombre).join(", "),
    };

    res.json({
      informacionPersonal,
      estadisticas: [
        { iconoKey: "promedio", valor: promedio.toFixed(1) },
        { iconoKey: "aprobadas", valor: `${materiasAprobadasUnicas}/${totalMateriasPlan}` },
      ],
      horarios: usuario.inscripciones.flatMap((i) =>
        i.ciclo.horarios.map((h) => ({
          nombre: i.ciclo.materiaPlan.materia.nombre,
          profesor: "—",
          horario: `Día ${h.dia_semana} Bloque ${h.bloque}`,
        }))
      ),
      materias: usuario.inscripciones.map((i) => ({
        nombre: i.ciclo.materiaPlan.materia.nombre,
        profesor: "—",
        estado: i.estado,
        horario: i.ciclo.horarios
          .map((h) => `${h.dia_semana}-${h.bloque}`)
          .join(", "),
        nota: i.nota_final,
      })),
      promedioGeneral: promedio.toFixed(1),
    });
  } catch (err) {
    next(err);
  }
};

exports.mostrarDatosPersonales = async (req, res, next) => {
  try {
    const idUsuario = req.params.id || req.user.id;
    const usuario = await Usuario.findByPk(idUsuario, {
      attributes: ["id"],
      include: [
        {
          model: Persona,
          as: "persona",
          attributes: ["email", "telefono"],
        },
      ],
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      email: usuario.persona.email,
      telefono: usuario.persona.telefono,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.actualizarDatosPersonales = async (req, res, next) => {
  const idUsuario = req.params.id || req.user.id;
  const { email, telefono } = req.body;
  try {
    const usuario = await Usuario.findByPk(idUsuario, {
      include: [{ model: Persona, as: "persona" }],
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    await usuario.persona.update({
      email,
      telefono,
    });
    res.json({
      message: "Datos actualizados correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.actualizarPassword = async (req, res, next) => {
  try {
    const { passwordActual, nuevoPassword } = req.body;
    const idUsuario = req.params.id || req.user.id;
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const passwordMatch = await bcrypt.compare(
      passwordActual,
      usuario.password
    );
    if (!passwordMatch) {
      return res.status(400).json({ message: "Password actual incorrecto" });
    }
    const hashedPassword = await bcrypt.hash(nuevoPassword, 10);
    await usuario.update({ password: hashedPassword });
    res.json({ message: "Password actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//Obtener las carreras en las que se inscribió el alumno
exports.getCarrerasInscripto = async (req, res) => {
  try {
    const { idAlumno } = req.params;

    const inscripciones = await AlumnoCarrera.findAll({
      where: { id_persona: idAlumno },
      include: [
        {
          model: Carrera,
          as: "carrera",
          attributes: ["id", "nombre"],
        },
      ],
    });

    // Extraer las carreras de las inscripciones
    const carreras = inscripciones.map((inscripcion) => inscripcion.carrera);

    if (!carreras.length) {
      return res
        .status(404)
        .json({ message: "El alumno no está inscripto en ninguna carrera." });
    }

    res.status(200).json(carreras);
  } catch (error) {
    console.error("Error al obtener las carreras del alumno: ", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

//Obtener las materias de un alumno para una carrera especifica
exports.getMateriasPorCarrera = async (req, res) => {
  try {
    const { idAlumno, idCarrera } = req.params;

    const inscripcion = await AlumnoCarrera.findOne({
      where: {
        id_persona: idAlumno,
        id_carrera: idCarrera,
      },
    });

    if (!inscripcion) {
      return res
        .status(404)
        .json({ message: "El alumno no esta inscripto en esta carrera. " });
    }

    // Obtener todos los planes de estudio para la carrera
    const planesEstudio = await PlanEstudio.findAll({
      where: { id_carrera: idCarrera },
      attributes: ["id"],
    });

    if (!planesEstudio || planesEstudio.length === 0) {
      return res.status(404).json({
        message: "No se encontró un plan de estudio para esta carrera.",
      });
    }

    const planEstudioIds = planesEstudio.map((plan) => plan.id);

    //Obtener las materias en las que se inscribio el alumno en esa carrera
    const materiasInscriptas = await InscripcionMateria.findAll({
      where: { id_usuario_alumno: idAlumno },
      include: [
        {
          model: MateriaPlanCicloLectivo,
          as: "ciclo",
          attributes: ["id"],
          include: [
            {
              model: Materia,
              as: "materia",
              attributes: ["id", "nombre"],
              include: [
                {
                  model: MateriaPlan,
                  as: "materiaPlan",
                  where: {
                    id_plan_estudio: planEstudioIds,
                  },
                },
              ],
            },

            {
              model: ProfesorMateria,
              as: "profesores",
              attributes: [],
              include: [
                {
                  model: Persona,
                  as: "persona",
                  attributes: ["nombre", "apellido"],
                },
              ],
            },
          ],
        },
      ],
    });

    // Función que transforma los datos para el frontend
    const resumenMateriasAlumno = materiasInscriptas.map((item) => ({
      id: item.ciclo.materia.id,
      nombre: item.ciclo.materia.nombre,
      estado: item.estado,
      nota: item.nota_final,
      profesor: item.ciclo.profesores
        ? item.ciclo.profesores
            .map((p) => `${p.persona.nombre} ${p.persona.apellido}`)
            .join(", ")
        : "Sin profesor asignado",
    }));
    res.status(200).json(resumenMateriasAlumno);
  } catch (error) {
    console.error("Error al obtener las materias del alumno: ", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

exports.listarCarreras = async (req, res, next) => {
  try {
    const carreras = await Carrera.findAll({
      attributes: ["id", "nombre"],
      order: [["nombre", "ASC"]],
    });

    res.json(carreras);
  } catch (error) {
    console.error("Error al listar carreras:", error);
    next(error);
  }
};

// Controlador para listar todos los alumnos
exports.listarAlumnos = async (req, res, next) => {
  try {
    const { activo, carrera } = req.query;

    // Construir condiciones de filtrado
    const whereConditions = {
      '$rol_usuarios.rol.nombre$': "Alumno",
    };

    const carreraInclude = {
      model: AlumnoCarrera,
      as: "carreras",
      attributes: ["fecha_inscripcion", "activo"],
      include: [
        {
          model: Carrera,
          as: "carrera",
          attributes: ["id", "nombre"],
        },
      ],
      required: false, // LEFT JOIN para no excluir usuarios sin carreras
    };

    // Aplicar filtros específicos si se proporcionan
    if (activo !== undefined || carrera) {
      const carreraWhere = {};
      
      if (activo !== undefined) {
        carreraWhere.activo = activo === 'true' ? 1 : 0;
      }
      
      if (carrera) {
        carreraWhere.id_carrera = carrera;
      }
      
      carreraInclude.where = carreraWhere;
      carreraInclude.required = true; // INNER JOIN cuando hay filtros específicos
    }

    const alumnos = await Usuario.findAll({
      include: [
        {
          model: Persona,
          as: "persona",
          attributes: ["nombre", "apellido", "dni", "email", "telefono"],
          include: [carreraInclude],
          required: true, // Asegurar que siempre tenga persona
        },
        {
          model: RolUsuario,
          as: "rol_usuarios",
          include: [
            {
              model: Rol,
              as: "rol",
              attributes: ["id", "nombre"],
              where: { nombre: "Alumno" },
            },
          ],
          required: true,
        },
      ],
      where: whereConditions,
    });

    const alumnosFormateados = alumnos.map((alumno) => {
      // Validar que persona existe
      if (!alumno.persona) {
        console.warn(`Usuario ${alumno.id} sin persona asociada`);
        return null;
      }

      const carreras = alumno.persona.carreras || [];
      const carreraActiva = carreras.find((c) => c.activo === 1) || carreras[0];

      return {
        id: alumno.id,
        username: alumno.username,
        nombre: alumno.persona.nombre,
        apellido: alumno.persona.apellido,
        dni: alumno.persona.dni,
        email: alumno.persona.email,
        telefono: alumno.persona.telefono,
        carrera: {
          id: carreraActiva?.carrera?.id || null,
          nombre: carreraActiva?.carrera?.nombre || "Sin carrera"
        },
        fechaInscripcion: carreraActiva?.fecha_inscripcion || null,
        activo: carreraActiva?.activo === 1,
      };
    }).filter(alumno => alumno !== null); // Filtrar elementos nulos

    res.json(alumnosFormateados);
  } catch (error) {
    console.error("Error al listar alumnos:", error);
    next(error);
  }
};
// Controlador para buscar alumnos por DNI o nombre
exports.buscarAlumnos = async (req, res, next) => {
  try {
    const term = req.query.term;
    if (!term) {
      return res.status(400).json({ message: "Término de búsqueda requerido" });
    }
    const alumnos = await Usuario.findAll({
      where: {},
      include: [
        {
          model: Persona,
          as: "persona",
          attributes: ["nombre", "apellido", "dni"],
          where: {
            [Op.or]: [
              { dni: { [Op.like]: `%${term}%` } },
              { nombre: { [Op.like]: `%${term}%` } },
              { apellido: { [Op.like]: `%${term}%` } },
            ],
          },
        },
        {
          model: RolUsuario,
          as: "rol_usuarios",
          include: [
            { model: Rol, as: "rol", where: { nombre: "Alumno" } },
          ],
        },
      ],
      limit: 10,
    });
    const resultados = alumnos.map((a) => ({
      id: a.id,
      nombre: a.persona.nombre,
      apellido: a.persona.apellido,
      dni: a.persona.dni,
    }));
    res.json(resultados);
  } catch (error) {
    next(error);
  }
};
