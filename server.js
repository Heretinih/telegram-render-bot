import express from "express";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===============================
   ROOT CHECK
================================ */
app.get("/", (req, res) => {
  res.status(200).send("OK - Structured Mode");
});

/* ===============================
   HELPERS
================================ */
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

function parseLocation(msg) {
  if (msg.location?.latitude && msg.location?.longitude) {
    return {
      lat: msg.location.latitude,
      lng: msg.location.longitude,
      valid: true
    };
  }

  return {
    lat: "REQUIRED",
    lng: "REQUIRED",
    valid: false
  };
}

/* ===============================
   TELEGRAM WEBHOOK
================================ */
app.post("/webhook", (req, res) => {
  const msg = req.body?.message;
  if (!msg) return res.sendStatus(200);

  const photos = Array.isArray(msg.photo) ? msg.photo : [];

  const record = {
    group_id: String(msg.chat?.id ?? ""),
    group_name: msg.chat?.title ?? "",

    user: {
      username:
        msg.from?.username ??
        msg.from?.first_name ??
        "UNKNOWN"
    },

    caption: parseCaption(msg.caption),

    location: parseLocation(msg),

    photos: {
      count: photos.length,
      photo_ids: photos.map(p => p.file_id)
    },

    time: {
      iso: msg.date
        ? new Date(msg.date * 1000).toISOString()
        : null
    }
  };

  console.log("===== FINAL NORMALIZED RECORD =====");
  console.log(JSON.stringify(record, null, 2));
  console.log("==================================");

  res.sendStatus(200);
});

/* ===============================
   FALLBACK
================================ */
app.all("*", (req, res) => {
  res.sendStatus(200);
});

/* ===============================
   PORT
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
