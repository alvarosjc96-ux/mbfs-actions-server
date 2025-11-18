import { processPdf } from "./ocr.js";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MBFS Actions Server online" });
});

app.post("/fetch_legal_url", async (req, res) => {
  try {
    const { url } = req.body;
    const r = await axios.get(url, { responseType: "text" });
    res.json({
      status: "ok",
      text_snippet: r.data.slice(0, 2000)
    });
  } catch (e) {
    res.json({ status: "error", error: e.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
app.post("/ocr_and_extract", async (req, res) => {
  try {
    const { base64_file, filename } = req.body;
    if (!base64_file) return res.json({ status: "error", error: "base64_file needed" });

    const result = await processPdf(base64_file, filename);
    res.json({ status: "ok", ...result });

  } catch (e) {
    res.json({ status: "error", error: e.message });
  }
});
