/**
 * server.js
 * Main webhook entry for Telegram → Parse → Normalize → Google Sheet
 */

import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";

import { parseTelegramUpdate } from "./parser.js";
import { normalizeRecord } from "./normalize.js";
import { appendRow, updateRowByMessageId } from "./sheet.js";

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

const PORT = process.env.PORT || 10000;

/**
 * Health check (Render / browser / HEAD / GET)
 */
app.get("/", (req, res) => {
  res.status(200).send("Telegram Visibility Bot is running");
});

/**
 * Telegram Webhook
 */
app.post("/", async (req, res) => {
  try {
    const update = req.body;

    console.log("=================================");
    console.log("RAW TELEGRAM UPDATE");
    console.log(JSON.stringify(update, null, 2));

    // -------- EDITED MESSAGE --------
    if (update.edited_message) {
      const parsed = parseTelegramUpdate(update, { edited: true });
      const normalized = normalizeRecord(parsed);

      console.log("EDIT DETECTED → updating row");
      console.log(normalized);

      await updateRowByMessageId(normalized);
      return res.sendStatus(200);
    }

    // -------- NEW MESSAGE --------
    if (update.message) {
      const parsed = parseTelegramUpdate(update, { edited: false });
      const normalized = normalizeRecord(parsed);

      console.log("NEW SUBMISSION");
      console.log(normalized);

      await appendRow(normalized);
      return res.sendStatus(200);
    }

    // Ignore other update types
    res.sendStatus(200);

  } catch (err) {
    console.error("WEBHOOK ERROR", err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
