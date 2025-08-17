// controllers/usuarios.controller.js
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
        { iconoKey: "materias", valor: `${totalMaterias}` },
        { iconoKey: "aprobadas", valor: `${aprobadas}/${totalMaterias}` },
        // Asistencia requeriría otro modelo (no incluido aquí)
      ],
      horarios: usuario.inscripciones.flatMap((i) =>
        i.ciclo.horarios.map((h) => ({
          nombre: i.ciclo.materia.nombre,
          profesor: "—", // Podrías extraerlo de profesor_materia si lo cargas
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
          attributes: [
            "email",
            "telefono",
          ],
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
}

exports.actualizarDatosPersonales = async (req, res, next) => {
  const idUsuario = req.params.id || req.user.id;
  const { email, telefono } = req.body;
  try {
    const usuario = await Usuario.findByPk(idUsuario, {
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    await usuario.update({email, telefono});
    res.json({ message: "Datos actualizados correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
  }

exports.actualizarPassword= async (req, res, next) => {
  try {
    const { passwordActual, nuevoPassword } = req.body;
    const idUsuario = req.params.id || req.user.id;
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const passwordMatch = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Password actual incorrecto" });
    }
    const hashedPassword = await bcrypt.hash(nuevoPassword, 10);
    await usuario.update({ password: hashedPassword });
    res.json({ message: "Password actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
}