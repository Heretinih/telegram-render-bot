import express from "express";

const app = express();

/* ===============================
   CONFIG
================================ */
const SALESMAN_MAP = {
  // TEST MAPPING — edit later
  "jobs_recruiter": "S001",
  "sreyvin_sales": "S002"
};

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===============================
   ROOT CHECK
================================ */
app.get("/", (req, res) => {
  res.send("OK - Test Mode (Submission + Edit Logging)");
});

/* ===============================
   HELPERS
================================ */
function resolveSalesman(username) {
  if (!username) {
    return { id: "REQUIRED", source: "missing" };
  }

  if (SALESMAN_MAP[username]) {
    return { id: SALESMAN_MAP[username], source: "telegram_mapping" };
  }

  return { id: "REQUIRED", source: "missing" };
}

function parseCaption(captionRaw) {
  if (!captionRaw || typeof captionRaw !== "string") {
    return {
      raw: null,
      outlet_id: "REQUIRED",
      outlet_name: "REQUIRED",
      valid: false
    };
  }

  const parts = captionRaw.split("-").map(p => p.trim());
  if (parts.length !== 2) {
    return {
      raw: captionRaw,
      outlet_id: "REQUIRED",
      outlet_name: "REQUIRED",
      valid: false
    };
  }

  const [a, b] = parts;
  const isNumA = /^\d+$/.test(a);
  const isNumB = /^\d+$/.test(b);

  if (isNumA && !isNumB) {
    return { raw: captionRaw, outlet_id: a, outlet_name: b, valid: true };
  }

  if (!isNumA && isNumB) {
    return { raw: captionRaw, outlet_id: b, outlet_name: a, valid: true };
  }

  return {
    raw: captionRaw,
    outlet_id: "REQUIRED",
    outlet_name: "REQUIRED",
    valid: false
  };
}

/* ===============================
   MAIN WEBHOOK
================================ */
app.post("/webhook", (req, res) => {

  /* ---------- NEW MESSAGE ---------- */
  if (req.body.message) {
    const msg = req.body.message;

    const username =
      msg.from?.username ??
      msg.from?.first_name ??
      "UNKNOWN";

    const salesman = resolveSalesman(username);
    const caption = parseCaption(msg.caption);

    const record = {
      Record_Type: "SUBMISSION",

      Message_ID: msg.message_id,
      Telegram_Time_ISO: new Date(msg.date * 1000).toISOString(),

      Group_ID: msg.chat?.id,
      Group_Name: msg.chat?.title,

      Salesman_ID: salesman.id,
      Salesman_Username: username,
      Salesman_Source: salesman.source,

      Outlet_ID: caption.outlet_id,
      Outlet_Name: caption.outlet_name,
      Caption_Raw: caption.raw,
      Caption_Valid: caption.valid ? "YES" : "NO",

      Edited: "NO",
      Status:
        caption.valid && salesman.id !== "REQUIRED"
          ? "OK"
          : "REQUIRED_FIELDS_MISSING"
    };

    console.log("===== NEW SUBMISSION =====");
    console.log(JSON.stringify(record, null, 2));
    console.log("==========================");

    return res.sendStatus(200);
  }

  /* ---------- EDITED MESSAGE ---------- */
  if (req.body.edited_message) {
    const msg = req.body.edited_message;

    const editedBy =
      msg.from?.username ??
      msg.from?.first_name ??
      "UNKNOWN";

    const editLog = {
      Record_Type: "EDIT_LOG",

      Message_ID: msg.message_id,
      Edited_By: editedBy,
      Edited_At_ISO: new Date(msg.edit_date * 1000).toISOString(),

      Edited_Caption_Raw: msg.caption ?? null,
      Edit_Action: "LOGGED_ONLY"
    };

    console.log("===== EDIT DETECTED =====");
    console.log(JSON.stringify(editLog, null, 2));
    console.log("========================");

    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

/* ===============================
   FALLBACK
================================ */
app.all("*", (req, res) => res.sendStatus(200));

/* ===============================
   PORT
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
