// server.js
import express from "express";
import bodyParser from "body-parser";
import { parseTelegramUpdate } from "./parser.js";

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Telegram Visibility Bot is running");
});

app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    const record = parseTelegramUpdate(update);

    if (record) {
      console.log("========== STRUCTURED RECORD ==========");
      console.log(JSON.stringify(record, null, 2));
      console.log("=======================================");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
