const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

const tplPath = path.join(
  process.cwd(),
  "src",
  "templates",
  "alumno_regular.hbs"
);
const logoPath = path.join(process.cwd(), "src", "assets", "logo.png");
const TPL = fs.readFileSync(tplPath, "utf8");

async function generarConstanciaAlumnoRegular(data) {
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const html = Handlebars.compile(TPL)({ ...data, logoBase64 });

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

function renderConstanciaHTML(data) {
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  return Handlebars.compile(TPL)({ ...data, logoBase64 });
}

module.exports = { generarConstanciaAlumnoRegular, renderConstanciaHTML };
