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
const verificationService = require("../../services/verificationService");
const { enviarCorreo } = require("../../lib/mailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

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
    if (
      carreraActiva.carrera &&
      carreraActiva.carrera.planesEstudio &&
      carreraActiva.carrera.planesEstudio.length > 0
    ) {
      const planVigente = carreraActiva.carrera.planesEstudio[0]; // Ya filtrado por vigente: 1
      totalMateriasPlan = planVigente.materiaPlans
        ? planVigente.materiaPlans.length
        : 0;
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
        {
          iconoKey: "aprobadas",
          valor: `${materiasAprobadasUnicas}/${totalMateriasPlan}`,
        },
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

    // Verificar si el usuario está intentando cambiar email o teléfono
    const emailCambiado = email && email !== usuario.persona.email;
    const telefonoCambiado = telefono && telefono !== usuario.persona.telefono;

    if (emailCambiado || telefonoCambiado) {
      return res.status(400).json({ 
        message: "Para cambiar email o teléfono, usa el endpoint de solicitud de verificación",
        requiresVerification: true
      });
    }

    // Si no hay cambios en email ni teléfono, actualizar normalmente
    await usuario.persona.update({
      email: email || usuario.persona.email,
      telefono: telefono || usuario.persona.telefono,
    });
    
    res.json({
      message: "Datos actualizados correctamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Solicitar cambio de email o teléfono
 * Genera un código y lo envía al email actual
 */
exports.solicitarCambioDato = async (req, res, next) => {
  try {
    const idUsuario = req.params.id || req.user.id;
    const { campo, nuevoValor } = req.body;

    // Validar campo
    if (!['email', 'telefono'].includes(campo)) {
      return res.status(400).json({ 
        message: "Campo inválido. Debe ser 'email' o 'telefono'" 
      });
    }

    // Validar que se proporcione el nuevo valor
    if (!nuevoValor || nuevoValor.trim() === '') {
      return res.status(400).json({ 
        message: "Debe proporcionar el nuevo valor" 
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findByPk(idUsuario, {
      include: [{ model: Persona, as: "persona" }],
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el nuevo valor sea diferente al actual
    if (usuario.persona[campo] === nuevoValor.trim()) {
      return res.status(400).json({ 
        message: `El nuevo ${campo} es igual al actual` 
      });
    }

    // Verificar si ya existe una solicitud pendiente
    const hasPending = await verificationService.hasPendingRequest(idUsuario, campo);
    if (hasPending) {
      const timeRemaining = await verificationService.getTimeRemaining(idUsuario, campo);
      return res.status(429).json({ 
        message: "Ya existe una solicitud pendiente. Espera a que expire o usa el código enviado.",
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0
      });
    }

    const expirationMinutes = 15;
    const code = await verificationService.createVerificationRequest(
      idUsuario,
      campo,
      nuevoValor.trim(),
      usuario.persona.email,
      expirationMinutes
    );

    // Leer y compilar la plantilla de email
    const templatePath = path.join(__dirname, '../../templates/verificacion_cambio.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const fieldNameMap = {
      email: 'correo electrónico',
      telefono: 'teléfono'
    };

    const html = template({
      fieldName: fieldNameMap[campo],
      newValue: nuevoValor.trim(),
      code,
      expirationMinutes
    });

    // Enviar email
    await enviarCorreo({
      to: usuario.persona.email,
      subject: `Verificación de cambio de ${fieldNameMap[campo]}`,
      html
    });

    res.json({ 
      message: `Código de verificación enviado a ${usuario.persona.email}`,
      expiresIn: expirationMinutes * 60 // segundos
    });

  } catch (error) {
    console.error('[ERROR] Error al solicitar cambio:', error);
    next(error);
  }
};

/**
 * Verificar código y aplicar cambio
 */
exports.verificarCambioDato = async (req, res, next) => {
  try {
    const idUsuario = req.params.id || req.user.id;
    const { campo, codigo } = req.body;

    // Validar campo
    if (!['email', 'telefono'].includes(campo)) {
      return res.status(400).json({ 
        message: "Campo inválido. Debe ser 'email' o 'telefono'" 
      });
    }

    // Validar código
    if (!codigo || codigo.trim() === '') {
      return res.status(400).json({ 
        message: "Debe proporcionar el código de verificación" 
      });
    }

    // Verificar código
    const verificationData = await verificationService.verifyCode(
      idUsuario, 
      campo, 
      codigo.trim()
    );

    if (!verificationData) {
      return res.status(400).json({ 
        message: "Código inválido o expirado" 
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findByPk(idUsuario, {
      include: [{ model: Persona, as: "persona" }],
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Aplicar el cambio
    await usuario.persona.update({
      [campo]: verificationData.newValue
    });

    // Eliminar la solicitud de verificación
    await verificationService.deleteVerificationRequest(idUsuario, campo);

    const fieldNameMap = {
      email: 'correo electrónico',
      telefono: 'teléfono'
    };

    res.json({ 
      message: `${fieldNameMap[campo]} actualizado correctamente`,
      newValue: verificationData.newValue
    });

  } catch (error) {
    console.error('[ERROR] Error al verificar cambio:', error);
    next(error);
  }
};

/**
 * Cancelar solicitud de cambio pendiente
 */
exports.cancelarCambioDato = async (req, res, next) => {
  try {
    const idUsuario = req.params.id || req.user.id;
    const { campo } = req.body;

    // Validar campo
    if (!['email', 'telefono'].includes(campo)) {
      return res.status(400).json({ 
        message: "Campo inválido. Debe ser 'email' o 'telefono'" 
      });
    }

    // Verificar si existe una solicitud pendiente
    const hasPending = await verificationService.hasPendingRequest(idUsuario, campo);
    
    if (!hasPending) {
      return res.status(404).json({ 
        message: "No hay ninguna solicitud pendiente para este campo" 
      });
    }

    // Eliminar la solicitud
    await verificationService.deleteVerificationRequest(idUsuario, campo);

    res.json({ 
      message: "Solicitud de cambio cancelada correctamente" 
    });

  } catch (error) {
    console.error('[ERROR] Error al cancelar cambio:', error);
    next(error);
  }
};

exports.actualizarPassword = async (req, res, next) => {
  try {
    const { actual, nueva } = req.body;
    const idUsuario = req.params.id || req.user.id;
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const passwordMatch = await bcrypt.compare(
      actual,
      usuario.password
    );
    if (!passwordMatch) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }
    const hashedPassword = await bcrypt.hash(nueva, 10);
    await usuario.update({ password: hashedPassword });
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
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
    });

    // Aplicar filtros específicos si se proporcionan
    if (activo !== undefined || carrera) {
      const carreraWhere = {};
      if (activo !== undefined) {
        carreraWhere.activo = activo === "true" ? 1 : 0;
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

    const alumnosFormateados = alumnos
      .map((alumno) => {
        // Validar que persona existe
        if (!alumno.persona) {
          console.warn(`Usuario ${alumno.id} sin persona asociada`);
          return null;
        }

        const carreras = alumno.persona.carreras || [];
        const carreraActiva =
          carreras.find((c) => c.activo === 1) || carreras[0];

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
            nombre: carreraActiva?.carrera?.nombre || "Sin carrera",
          },
          fechaInscripcion: carreraActiva?.fecha_inscripcion || null,
          activo: carreraActiva?.activo === 1,
        };
      })
      .filter((alumno) => alumno !== null); // Filtrar elementos nulos

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
          include: [{ model: Rol, as: "rol", where: { nombre: "Alumno" } }],
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
      "$rol_usuarios.rol.nombre$": "Alumno",
    };

    const carreraInclude = {
      model: AlumnoCarrera,
      as: "carreras",
      attributes: ["fecha_inscripcion", "activo", "id_plan_estudio_asignado"],
      include: [
        {
          model: Carrera,
          as: "carrera",
          attributes: ["id", "nombre"],
        },
        {
          model: PlanEstudio,
          as: "planEstudio",
          attributes: ["id", "resolucion"],
        }
      ],
      required: false, // LEFT JOIN para no excluir usuarios sin carreras
    };

    // Aplicar filtros específicos si se proporcionan
    if (activo !== undefined || carrera) {
      const carreraWhere = {};
      if (activo !== undefined) {
        carreraWhere.activo = activo === "true" ? 1 : 0;
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

    const alumnosFormateados = alumnos
      .map((alumno) => {
        // Validar que persona existe
        if (!alumno.persona) {
          console.warn(`Usuario ${alumno.id} sin persona asociada`);
          return null;
        }

        const carreras = alumno.persona.carreras || [];
        const carreraActiva =
          carreras.find((c) => c.activo === 1) || carreras[0];

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
            nombre: carreraActiva?.carrera?.nombre || "Sin carrera",
          },
          fechaInscripcion: carreraActiva?.fecha_inscripcion || null,
          activo: carreraActiva?.activo === 1,
          resolucionPlanAsignado: carreraActiva?.planEstudio?.resolucion || null,
        };
      })
      .filter((alumno) => alumno !== null); // Filtrar elementos nulos

    res.json(alumnosFormateados);
  } catch (error) {
    console.error("Error al listar alumnos:", error);
    next(error);
  }
};

exports.obtenerIdPersona = async (req, res, next) => {
  try {
    const idUsuario = req.user.id;
    const usuario = await Usuario.findByPk(idUsuario, {
      attributes: ["id_persona"],
    });
    res.json({ id_persona: usuario.id_persona });
  } catch (error) {
    next(error);
  }
};
