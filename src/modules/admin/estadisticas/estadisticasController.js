const {
  AlumnoCarrera,
  Persona,
  Carrera,
  AlumnoTipo,
} = require("../../../models/");
const { Op, fn, col, literal } = require("sequelize");

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const cumpleanos = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - cumpleanos.getFullYear();
  const mes = hoy.getMonth() - cumpleanos.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
    edad--;
  }
  return edad;
};

exports.getEstadisticas = async (req, res, next) => {
  try {
    const generoPorCarrera = await AlumnoCarrera.findAll({
      attributes: [
        "id_carrera",
        [
          literal('SUM(CASE WHEN `persona`.`sexo` = "M" THEN 1 ELSE 0 END)'),
          "hombres",
        ],
        [
          literal('SUM(CASE WHEN `persona`.`sexo` = "F" THEN 1 ELSE 0 END)'),
          "mujeres",
        ],
        [
          literal('SUM(CASE WHEN `persona`.`sexo` = "X" THEN 1 ELSE 0 END)'),
          "noBin",
        ],
      ],
      include: [
        { model: Persona, as: "persona", attributes: ["sexo"] },
        { model: Carrera, as: "carrera", attributes: ["nombre"] },
      ],
      group: ["id_carrera", col("carrera.nombre")],
      raw: true,
      subQuery: false,
    });

    // edad
    const alumnosConEdad = await Persona.findAll({
      attributes: ["fecha_nacimiento"],
    });

    const rangos = {
      "19-20": 0,
      "21-22": 0,
      "23-24": 0,
      "25-29": 0,
      "30-34": 0,
      "35+": 0,
    };

    alumnosConEdad.forEach((alumno) => {
      const edad = calcularEdad(alumno.fecha_nacimiento);
      if (edad >= 19 && edad <= 20) rangos["19-20"]++;
      else if (edad >= 21 && edad <= 22) rangos["21-22"]++;
      else if (edad >= 23 && edad <= 24) rangos["23-24"]++;
      else if (edad >= 25 && edad <= 29) rangos["25-29"]++;
      else if (edad >= 30 && edad <= 34) rangos["30-34"]++;
      else if (edad >= 35) rangos["35+"]++;
    });

    const rangoEtario = Object.keys(rangos).map((key) => ({
      rango: key,
      estudiantes: rangos[key],
    }));

    // // cantidad por año
    // const tipoEgresado = await AlumnoTipo.findOne({
    //   where: { nombre: "Egresado" },
    // });
    // if (!tipoEgresado) {
    //   return res
    //     .status(404)
    //     .json({ message: 'Tipo de alumno "Egresado" no encontrado.' });
    // }

    // const egresadosPorAnio = await AlumnoCarrera.findAll({
    //   where: { id_tipo_alumno: tipoEgresado.id },
    //   attributes: [
    //     [fn("YEAR", col("fecha_inscripcion")), "anio"],
    //     [fn("COUNT", col("id")), "cantidad"],
    //   ],
    //   group: [fn("YEAR", col("fecha_inscripcion"))],
    //   raw: true,
    // });

    const estadisticas = { generoPorCarrera, rangoEtario };
    res.status(200).json(estadisticas);
  } catch (err) {
    next(err);
  }
};
