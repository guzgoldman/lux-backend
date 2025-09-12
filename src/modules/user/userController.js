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
  ProfesorMateria,
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
                  model: Materia,
                  as: "materia",
                  attributes: ["nombre"],
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

    const totalMaterias = usuario.inscripciones.length;
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
      todasNotas.length > 0
        ? todasNotas.reduce((sum, ev) => sum + parseFloat(ev.nota || 0), 0) /
          todasNotas.length
        : 0;

    const tipoAlumnoMap = {
      1: "Regular",
      2: "Libre",
      3: "Oyente",
      4: "Itinerante",
    };

    const carreras = usuario.persona.carreras || [];
    let carreraActiva =
      carreras.find((c) => c.activo === 1) || carreras[0] || {};
    const idTipo = carreraActiva?.id_tipo_alumno;

    const informacionPersonal = {
      nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
      fechaNacimiento: usuario.persona.fecha_nacimiento,
      dni: usuario.persona.dni,
      ingreso: carreraActiva?.fecha_inscripcion || null,
      condicion: tipoAlumnoMap[idTipo] || "Desconocido",
      carrera: carreras.map((c) => c.carrera?.nombre).join(", "),
    };

    res.json({
      informacionPersonal,
      estadisticas: [
        { iconoKey: "promedio", valor: promedio.toFixed(1) },
        { iconoKey: "materias", valor: totalMaterias },
        { iconoKey: "aprobadas", valor: `${aprobadas}/${totalMaterias}` },
      ],
      horarios: usuario.inscripciones.flatMap((i) =>
        i.ciclo.horarios.map((h) => ({
          nombre: i.ciclo.materia.nombre,
          profesor: "—",
          horario: `Día ${h.dia_semana} Bloque ${h.bloque}`,
        }))
      ),
      materias: usuario.inscripciones.map((i) => ({
        nombre: i.ciclo.materia.nombre,
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
