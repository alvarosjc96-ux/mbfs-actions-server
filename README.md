# MBFS Actions Server

Archivos: Dockerfile, package.json, server.js, ocr.js

## Deploy en Render
- Runtime: **Docker**
- Build command: (vacío)
- Start command: (no hace falta, Dockerfile arranca node server.js)
- Manual deploy → Clear build cache & deploy

## Endpoints
- GET /                -> health
- GET /health          -> health
- POST /fetch_legal_url  { "url": "https://..." }
- POST /ocr_and_extract { "base64_file": "BASE64_PDF", "filename": "doc.pdf" }

## Probar OCR (ejemplo)
Linux / mac:
```bash
BASE64=$(base64 -w0 documento.pdf)
curl -X POST "https://TU-SERVIDOR.onrender.com/ocr_and_extract" \
  -H "Content-Type: application/json" \
  -d "{\"base64_file\":\"$BASE64\",\"filename\":\"documento.pdf\"}"
