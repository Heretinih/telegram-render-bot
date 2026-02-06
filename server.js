import express from "express";
import bodyParser from "body-parser";
import { appendSubmission, updateSubmission } from "./sheet.js";

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  try {
    const payload = req.body;

    // Telegram edit
    if (payload.edited_message) {
      console.log(">>> UPDATE EXISTING ROW");
      await updateSubmission(payload.edited_message);
    }

    // Telegram new message
    if (payload.message) {
      console.log(">>> APPEND NEW ROW");
      await appendSubmission(payload.message);
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("ERROR");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
