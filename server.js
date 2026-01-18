import express from "express";

const app = express();

/* ======================================================
   REQUIRED BODY PARSERS (THIS FIXES YOUR ISSUE)
====================================================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   ROOT ENDPOINT (RENDER / BROWSER CHECK)
====================================================== */
app.get("/", (req, res) => {
  res.status(200).send("OK - Telegram Webhook Server Running");
});

/* ======================================================
   TELEGRAM WEBHOOK ENDPOINT (POST ONLY)
====================================================== */
app.post("/webhook", (req, res) => {
  console.log("=================================");
  console.log("📩 TELEGRAM WEBHOOK RECEIVED");
  console.log("Time:", new Date().toISOString());
  console.log("Body:");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("=================================");

  // Always reply 200 to Telegram
  res.sendStatus(200);
});

/* ======================================================
   CATCH ALL (LOG UNEXPECTED REQUESTS)
====================================================== */
app.all("*", (req, res) => {
  console.log("⚠️ UNKNOWN REQUEST");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  res.sendStatus(200);
});

/* ======================================================
   RENDER PORT BINDING (MANDATORY)
====================================================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
