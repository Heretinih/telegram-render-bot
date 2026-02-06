import { GoogleSpreadsheet } from "google-spreadsheet";

const SHEET_NAME = "Submissions";

/**
 * Connect to Google Sheet
 */
async function getSheet() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[SHEET_NAME];
  if (!sheet) {
    throw new Error("Submissions sheet not found");
  }

  return sheet;
}

/**
 * Append new Telegram submission
 */
export async function appendSubmission(message) {
  const sheet = await getSheet();

  await sheet.addRow({
    message_id: message.message_id,
    telegram_date: new Date(message.date * 1000).toISOString(),
    telegram_username: message.from?.username || "",
    caption_raw: message.caption || "",
    edited: false,
    edited_at: "",
    edited_by: "",
    latitude: message.location?.latitude || "",
    longitude: message.location?.longitude || "",
    created_at: new Date().toISOString(),
  });
}

/**
 * Update existing submission on edit
 */
export async function updateSubmission(editedMessage) {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  const row = rows.find(
    r => String(r.message_id) === String(editedMessage.message_id)
  );

  if (!row) {
    console.warn("Edited message not found in sheet");
    return;
  }

  row.caption_raw = editedMessage.caption || row.caption_raw;
  row.edited = true;
  row.edited_at = new Date().toISOString();
  row.edited_by = editedMessage.from?.username || "";

  await row.save();
}
