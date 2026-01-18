const express = require("express");
const app = express();

app.use(express.json());

// LOG EVERY REQUEST (CRITICAL DEBUG)
app.use((req, res, next) => {
  console.log("=== INCOMING REQUEST ===");
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("========================");
  next();
});

app.get("/", (req, res) => {
  res.send("Render service is running");
});

app.post("/", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
