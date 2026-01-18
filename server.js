const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Render service is running");
});

app.post("/", (req, res) => {
  console.log("Incoming webhook:", req.body);
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
