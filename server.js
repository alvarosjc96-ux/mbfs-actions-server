import { processPdf } from "./ocr.js";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MBFS Actions Server online" });
});

app.post("/fetch_legal_url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ status: "error", error: "url required" });
    const r = await axios.get(url, { responseType: "text", timeout: 20000 });
    res.json({
      status: "ok",
      text_snippet: (r.data || "").slice(0, 2000)
    });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message || String(e) });
  }
});

app.post("/ocr_and_extract", async (req, res) => {
  try {
    const { base64_file, filename } = req.body;
    if (!base64_file) return res.status(400).json({ status: "error", error: "base64_file needed" });

    const result = await processPdf(base64_file, filename);
    res.json({ status: "ok", ...result });

  } catch (e) {
    res.status(500).json({ status: "error", error: e.message || String(e) });
  }
});

// health
app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
