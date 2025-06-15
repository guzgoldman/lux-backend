// src/modules/preinscripcion/preinscripcion.controller.js
const { sequelize, Persona, Direccion, Preinscripcion } = require('../../models');

exports.createPreinscripcion = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
      let persona = await Persona.findOne({
        where: { dni: req.body.numeroDocumento },
        transaction: t
      });

    if (!persona) {
      persona = await Persona.create({
          nombre:           req.body.nombre,
          apellido:         req.body.apellido,
          sexo:             req.body.sexo,
          dni:              req.body.numeroDocumento,
          email:            req.body.email,
          telefono:         req.body.telefono,
          fecha_nacimiento: req.body.fechaNacimiento
      }, { transaction: t });

      await Direccion.create({
          calle:       req.body.calle,
          altura:      req.body.altura,
          piso:        req.body.piso,
          departamento:req.body.departamento,
          localidad:   req.body.localidad,
          id_persona:  persona.id
      }, { transaction: t });
    }

    const preinscripcion = await Preinscripcion.create({
        id_persona: persona.id,
        id_carrera: req.body.carrera,
        comentario: req.body.observaciones
    }, {transaction: t});

    await t.commit();
    res.status(201).json({
        message: 'Preinscripción recibida',
        personaId: persona.id,
        preinscripcionId: preinscripcion.id
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
