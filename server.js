import express from "express";

const app = express();

/* ===================================================
   REQUIRED BODY PARSERS (WITHOUT THIS, POST FAILS)
=================================================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===================================================
   ROOT ENDPOINT (BROWSER / RENDER CHECK)
=================================================== */
app.get("/", (req, res) => {
  res.status(200).send("OK - Telegram Render Bot Running");
});

/* ===================================================
   TELEGRAM WEBHOOK ENDPOINT
=================================================== */
app.post("/webhook", (req, res) => {
  console.log("====================================");
  console.log("✅ TELEGRAM POST RECEIVED");
  console.log("Time:", new Date().toISOString());
  console.log("Payload:");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("====================================");

  // Always respond quickly
  res.sendStatus(200);
});

/* ===================================================
   CATCH-ALL (RENDER / CLOUDFLARE HEALTH CHECKS)
=================================================== */
app.all("*", (req, res) => {
  console.log("ℹ️ Non-webhook request:", req.method, req.url);
  res.sendStatus(200);
});

/* ===================================================
   RENDER PORT (MANDATORY)
=================================================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
