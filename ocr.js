import fs from "fs";
import pdfParse from "pdf-parse";
import { exec } from "child_process";
import util from "util";
import crypto from "crypto";

const execAsync = util.promisify(exec);

// Convierte un PDF en imágenes para OCR (si no tiene texto)
async function pdfToPng(pdfBuffer, outputPrefix) {
  const tmpPdf = `/tmp/${outputPrefix}.pdf`;
  fs.writeFileSync(tmpPdf, pdfBuffer);
  const cmd = `pdftoppm ${tmpPdf} /tmp/${outputPrefix} -png`;
  await execAsync(cmd);
  const files = fs.readdirSync("/tmp").filter(f => f.startsWith(outputPrefix) && f.endsWith(".png"));
  return files.map(file => `/tmp/${file}`);
}

// Aplica OCR Tesseract a una imagen
async function ocrImage(path) {
  const out = path.replace(".png", "");
  const cmd = `tesseract ${path} ${out} --oem 1 --psm 3`;
  await execAsync(cmd);
  return fs.readFileSync(`${out}.txt`, "utf8");
}

// Detecta entidades básicas en texto
function extractEntities(text) {
  const nif = text.match(/\b([0-9]{7,8}[A-Za-z])\b/);
  const fecha = text.match(/\b\d{1,2}\s+de\s+[A-Za-z]+\s+de\s+20[0-9]{2}\b/);
  const notario = text.match(/Notar(i|í)a\s+[A-ZÁÉÍÓÚa-záéíóúñ\s]+/);

  return {
    nif: nif ? nif[0] : null,
    fecha: fecha ? fecha[0] : null,
    notario: notario ? notario[0] : null
  };
}

export async function processPdf(base64, filename = "file.pdf") {
  const buffer = Buffer.from(base64, "base64");
  let text = "";

  // Primero intentamos extraer texto directamente (PDF con capa de texto)
  try {
    const data = await pdfParse(buffer);
    if (data.text.trim().length > 100) {
      text = data.text;
    }
  } catch (_) {}

  // Si no hay texto -> OCR avanzado
  if (!text || text.trim().length < 50) {
    const prefix = crypto.randomBytes(6).toString("hex");
    const images = await pdfToPng(buffer, prefix);

    let ocrText = "";
    for (const img of images) {
      ocrText += await ocrImage(img);
    }
    text = ocrText;
  }

  return {
    text_snippet: text.slice(0, 3000),
    entities: extractEntities(text),
    confidence: text.length > 500 ? 0.90 : 0.45
  };
}
