const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

// ✅ OPTIMIZACIÓN 1: Browser singleton con pool de páginas reutilizables
let browserInstance = null;
let pagePool = [];
const MAX_PAGES = 3; // Pool de páginas reutilizables

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new', // Usar el nuevo modo headless más rápido
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-images', // ✅ No cargar imágenes para PDFs más rápidos
        '--disable-javascript', // ✅ No ejecutar JS innecesario
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    // Pre-crear páginas en el pool
    for (let i = 0; i < MAX_PAGES; i++) {
      const page = await browserInstance.newPage();
      await page.setDefaultTimeout(5000); // ✅ Timeout más corto
      pagePool.push(page);
    }
  }
  return browserInstance;
}

async function getPage() {
  await getBrowser();
  if (pagePool.length > 0) {
    return pagePool.pop();
  }
  // Si no hay páginas disponibles, crear una nueva
  const page = await browserInstance.newPage();
  await page.setDefaultTimeout(5000);
  return page;
}

function releasePage(page) {
  if (pagePool.length < MAX_PAGES) {
    // Limpiar la página y devolverla al pool
    page.goto('about:blank').catch(() => {});
    pagePool.push(page);
  } else {
    // Si el pool está lleno, cerrar la página
    page.close().catch(() => {});
  }
}

// ✅ OPTIMIZACIÓN 2: Templates precompilados en memoria
const tplAlumnoRegularPath = path.join(process.cwd(), "src", "templates", "alumno_regular.hbs");
const logoPath = path.join(process.cwd(), "src", "assets", "logo.png");

// Leer y compilar templates una sola vez al inicio
const TPL_ALUMNO_REGULAR = fs.readFileSync(tplAlumnoRegularPath, "utf8");
const COMPILED_TPL_ALUMNO_REGULAR = Handlebars.compile(TPL_ALUMNO_REGULAR);

// ✅ OPTIMIZACIÓN 3: Logo en base64 cacheado
let logoBase64Cache = null;
function getLogoBase64() {
  if (!logoBase64Cache) {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64Cache = logoBuffer.toString("base64");
  }
  return logoBase64Cache;
}

// ✅ OPTIMIZACIÓN 4: Función de generación optimizada
async function generarConstanciaAlumnoRegular(data) {
  const page = await getPage();
  
  try {
    // Preparar datos con logo cacheado
    const dataWithLogo = {
      ...data,
      logoBase64: getLogoBase64()
    };

    // ✅ Usar template precompilado
    const html = COMPILED_TPL_ALUMNO_REGULAR(dataWithLogo);

    // ✅ Configuración optimizada para PDF
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded', // No esperar a que carguen todas las imágenes
      timeout: 3000 
    });

    // ✅ Generar PDF con configuración optimizada
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 3000 // Timeout más corto
    });

    return pdfBuffer;
  } finally {
    // ✅ Devolver página al pool en lugar de cerrarla
    releasePage(page);
  }
}

// ✅ OPTIMIZACIÓN 5: Templates precompilados para otros certificados
const COMPILED_TPL_MATERIAS_APROBADAS = Handlebars.compile(`
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
        {{#if isManual}}
        es estudiante del instituto.
        {{else}}
        ha aprobado {{totalMaterias}} materias.
        {{/if}}</p>
        
        <p>Se extiende el presente certificado a los {{dia}} días del mes de {{mes}} de {{anio}}.</p>
    </div>
    
    <div class="footer">
        <p>{{contacto}}</p>
        <p>{{sitio}}</p>
    </div>
</body>
</html>
`);

async function generarCertificadoMateriasAprobadas(data) {
  const page = await getPage();
  
  try {
    const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
    const html = COMPILED_TPL_MATERIAS_APROBADAS(dataWithLogo);

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 3000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      timeout: 3000
    });

    return pdfBuffer;
  } finally {
    releasePage(page);
  }
}

// Similar para asistencia a examen...
const COMPILED_TPL_ASISTENCIA_EXAMEN = Handlebars.compile(`
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
        {{#if isManual}}
        ha asistido a exámenes en el instituto.
        {{else}}
        ha asistido a {{totalExamenes}} exámenes.
        {{/if}}</p>
        
        <p>Se extiende el presente certificado a los {{dia}} días del mes de {{mes}} de {{anio}}.</p>
    </div>
    
    <div class="footer">
        <p>{{contacto}}</p>
        <p>{{sitio}}</p>
    </div>
</body>
</html>
`);

async function generarCertificadoAsistenciaExamen(data) {
  const page = await getPage();
  
  try {
    const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
    const html = COMPILED_TPL_ASISTENCIA_EXAMEN(dataWithLogo);

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 3000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      timeout: 3000
    });

    return pdfBuffer;
  } finally {
    releasePage(page);
  }
}

// ✅ OPTIMIZACIÓN 6: Función de renderizado rápido para HTML
function renderConstanciaHTML(data) {
  const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
  return COMPILED_TPL_ALUMNO_REGULAR(dataWithLogo);
}

function renderCertificadoMateriasAprobadasHTML(data) {
  const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
  return COMPILED_TPL_MATERIAS_APROBADAS(dataWithLogo);
}

function renderCertificadoAsistenciaExamenHTML(data) {
  const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
  return COMPILED_TPL_ASISTENCIA_EXAMEN(dataWithLogo);
}

// ✅ OPTIMIZACIÓN 7: Cleanup cuando se cierra la app
process.on('exit', async () => {
  if (browserInstance) {
    await browserInstance.close();
  }
});

module.exports = {
  generarConstanciaAlumnoRegular,
  renderConstanciaHTML,
  generarCertificadoMateriasAprobadas,
  renderCertificadoMateriasAprobadasHTML,
  generarCertificadoAsistenciaExamen,
  renderCertificadoAsistenciaExamenHTML,
};