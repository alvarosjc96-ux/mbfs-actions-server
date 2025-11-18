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
