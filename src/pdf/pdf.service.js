const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const tplAlumnoRegularPath = path.join(
  process.cwd(),
  "src",
  "templates",
  "alumno_regular.hbs"
);
const logoPath = path.join(process.cwd(), "src", "assets", "logo.png");
const TPL_ALUMNO_REGULAR = fs.readFileSync(tplAlumnoRegularPath, "utf8");

// Templates para los nuevos certificados (por ahora usaremos el mismo template base)
// Luego podrás crear templates específicos para cada tipo
const TPL_MATERIAS_APROBADAS = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificado de Materias Aprobadas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 100px; }
        .title { font-size: 18px; font-weight: bold; margin: 20px 0; }
        .content { line-height: 1.6; }
        .materias-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .materias-table th, .materias-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .materias-table th { background-color: #f5f5f5; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="data:image/png;base64,{{logoBase64}}" alt="Logo" class="logo">
        <h1>Instituto Superior de Formación Docente y Técnica N° 185</h1>
        <p>Luján de Buen Viaje</p>
    </div>
    
    <div class="title">CERTIFICADO DE MATERIAS APROBADAS</div>
    
    <div class="content">
        <p>Se certifica que <strong>{{apellido}}, {{nombre}}</strong>, DNI <strong>{{dni}}</strong>, 
        ha aprobado las siguientes materias:</p>
        
        {{#if materias}}
        <table class="materias-table">
            <thead>
                <tr>
                    <th>Materia</th>
                    <th>Carrera</th>
                    <th>Fecha de Aprobación</th>
                    <th>Ciclo Lectivo</th>
                </tr>
            </thead>
            <tbody>
                {{#each materias}}
                <tr>
                    <td>{{this.nombre}}</td>
                    <td>{{this.carrera}}</td>
                    <td>{{this.fechaAprobacion}}</td>
                    <td>{{this.cicloLectivo}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        <p><strong>Total de materias aprobadas: {{totalMaterias}}</strong></p>
        {{else}}
        <p>No se registran materias aprobadas para este alumno.</p>
        {{/if}}
        
        <p>Se extiende el presente certificado a los {{dia}} días del mes de {{mes}} de {{anio}}.</p>
    </div>
    
    <div class="footer">
        <p>{{contacto}}</p>
        <p>{{sitio}}</p>
    </div>
</body>
</html>
`;

const TPL_ASISTENCIA_EXAMEN = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificado de Asistencia a Examen</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 100px; }
        .title { font-size: 18px; font-weight: bold; margin: 20px 0; }
        .content { line-height: 1.6; }
        .examenes-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .examenes-table th, .examenes-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .examenes-table th { background-color: #f5f5f5; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="data:image/png;base64,{{logoBase64}}" alt="Logo" class="logo">
        <h1>Instituto Superior de Formación Docente y Técnica N° 185</h1>
        <p>Luján de Buen Viaje</p>
    </div>
    
    <div class="title">CERTIFICADO DE ASISTENCIA A EXAMEN</div>
    
    <div class="content">
        <p>Se certifica que <strong>{{apellido}}, {{nombre}}</strong>, DNI <strong>{{dni}}</strong>, 
        ha asistido a los siguientes exámenes finales:</p>
        
        {{#if examenes}}
        <table class="examenes-table">
            <thead>
                <tr>
                    <th>Materia</th>
                    <th>Carrera</th>
                    <th>Fecha de Examen</th>
                    <th>Llamado</th>
                    <th>Presente</th>
                </tr>
            </thead>
            <tbody>
                {{#each examenes}}
                <tr>
                    <td>{{this.materia}}</td>
                    <td>{{this.carrera}}</td>
                    <td>{{this.fechaExamen}}</td>
                    <td>{{this.llamado}}</td>
                    <td>{{this.presente}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        <p><strong>Total de exámenes: {{totalExamenes}}</strong></p>
        {{else}}
        <p>No se registran asistencias a exámenes para este alumno.</p>
        {{/if}}
        
        <p>Se extiende el presente certificado a los {{dia}} días del mes de {{mes}} de {{anio}}.</p>
    </div>
    
    <div class="footer">
        <p>{{contacto}}</p>
        <p>{{sitio}}</p>
    </div>
</body>
</html>
`;

async function generarPDF(template, data) {
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const html = Handlebars.compile(template)({ ...data, logoBase64 });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });
    await page.emulateMediaType("screen");

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
  } finally {
    await browser.close();
  }
}

function renderHTML(template, data) {
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  return Handlebars.compile(template)({ ...data, logoBase64 });
}

// Funciones para Certificado de Alumno Regular
async function generarConstanciaAlumnoRegular(data) {
  return await generarPDF(TPL_ALUMNO_REGULAR, data);
}

function renderConstanciaHTML(data) {
  return renderHTML(TPL_ALUMNO_REGULAR, data);
}

// Funciones para Certificado de Materias Aprobadas
async function generarCertificadoMateriasAprobadas(data) {
  return await generarPDF(TPL_MATERIAS_APROBADAS, data);
}

function renderCertificadoMateriasAprobadasHTML(data) {
  return renderHTML(TPL_MATERIAS_APROBADAS, data);
}

// Funciones para Certificado de Asistencia a Examen
async function generarCertificadoAsistenciaExamen(data) {
  return await generarPDF(TPL_ASISTENCIA_EXAMEN, data);
}

function renderCertificadoAsistenciaExamenHTML(data) {
  return renderHTML(TPL_ASISTENCIA_EXAMEN, data);
}

module.exports = { 
  generarConstanciaAlumnoRegular, 
  renderConstanciaHTML,
  generarCertificadoMateriasAprobadas,
  generarCertificadoAsistenciaExamen,
  renderCertificadoMateriasAprobadasHTML,
  renderCertificadoAsistenciaExamenHTML
};