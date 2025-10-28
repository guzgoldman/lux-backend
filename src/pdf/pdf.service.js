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
    const page = pagePool.pop();
    // Asegurarse de que la página esté limpia antes de devolverla
    await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 1000 }).catch(() => {});
    return page;
  }
  // Si no hay páginas disponibles, crear una nueva
  const page = await browserInstance.newPage();
  await page.setDefaultTimeout(5000);
  return page;
}

async function releasePage(page) {
  if (pagePool.length < MAX_PAGES) {
    // Devolver la página al pool (la limpieza se hace en getPage)
    pagePool.push(page);
  } else {
    // Si el pool está lleno, cerrar la página
    await page.close().catch(() => {});
  }
}

// ✅ OPTIMIZACIÓN 2: Templates precompilados en memoria
const tplAlumnoRegularPath = path.join(process.cwd(), "src", "templates", "alumno_regular.hbs");
const tplAsistenciaExamenPath = path.join(process.cwd(), "src", "templates", "asistencia_examen.hbs");
const tplMateriasAprobadasPath = path.join(process.cwd(), "src", "templates", "certificado_materias_aprobadas.hbs");
const tplPlanCompletoPath = path.join(process.cwd(), "src", "templates", "plan_estudios_completo.hbs");
const logoPath = path.join(process.cwd(), "src", "assets", "logo.png");

// Leer y compilar templates una sola vez al inicio
const TPL_ALUMNO_REGULAR = fs.readFileSync(tplAlumnoRegularPath, "utf8");
const COMPILED_TPL_ALUMNO_REGULAR = Handlebars.compile(TPL_ALUMNO_REGULAR);

const TPL_ASISTENCIA_EXAMEN = fs.readFileSync(tplAsistenciaExamenPath, "utf8");
const COMPILED_TPL_ASISTENCIA_EXAMEN = Handlebars.compile(TPL_ASISTENCIA_EXAMEN);

const TPL_MATERIAS_APROBADAS = fs.readFileSync(tplMateriasAprobadasPath, "utf8");
const COMPILED_TPL_MATERIAS_APROBADAS = Handlebars.compile(TPL_MATERIAS_APROBADAS);

const TPL_PLAN_COMPLETO = fs.readFileSync(tplPlanCompletoPath, "utf8");
const COMPILED_TPL_PLAN_COMPLETO = Handlebars.compile(TPL_PLAN_COMPLETO);

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
    await releasePage(page);
  }
}

// ✅ Función de generación optimizada para materias aprobadas
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
    await releasePage(page);
  }
}

// Similar para asistencia a examen...
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
    await releasePage(page);
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

// Función para generar plan de estudios completo (horizontal)
async function generarPlanEstudiosCompleto(data) {
  const page = await getPage();
  
  try {
    const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
    const html = COMPILED_TPL_PLAN_COMPLETO(dataWithLogo);

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 3000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false, // ✅ Vertical
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true,
      timeout: 3000
    });

    return pdfBuffer;
  } finally {
    await releasePage(page);
  }
}

function renderPlanEstudiosCompletoHTML(data) {
  const dataWithLogo = { ...data, logoBase64: getLogoBase64() };
  return COMPILED_TPL_PLAN_COMPLETO(dataWithLogo);
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
  generarPlanEstudiosCompleto,
  renderPlanEstudiosCompletoHTML,
};