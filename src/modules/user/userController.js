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
      (i) => i.estado === "APROBADA"
    ).length;

    const todasNotas = usuario.inscripciones.flatMap((i) => i.evaluaciones);
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
    });

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
        .json({ message: "El alumno no esta inscripto en esta carrera." });
    }

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

    const resumenMateriasAlumno = materiasInscriptas.map((item) => ({
      id: item.ciclo.materia.id,
      nombre: item.ciclo.materia.nombre,
      estado: item.estado,
      nota: item.nota_final,
      profesor: item.ciclo.profesores?.length
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
