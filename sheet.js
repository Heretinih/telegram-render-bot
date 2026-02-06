import { GoogleSpreadsheet } from "google-spreadsheet";

const SHEET_NAME = "Submissions";

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

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuth() {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getDoc() {
  const auth = getAuth();
  const doc = new GoogleSpreadsheet(SHEET_ID, auth);
  await doc.loadInfo();
  return doc;
}

export async function appendSubmission(record) {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Submissions'];
  if (!sheet) throw new Error('Submissions sheet not found');

  await sheet.addRow(record);
}

export async function updateSubmissionByMessageId(messageId, updates) {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Submissions'];
  if (!sheet) throw new Error('Submissions sheet not found');

  const rows = await sheet.getRows();
  const row = rows.find(r => String(r.message_id) === String(messageId));
  if (!row) return;

  Object.assign(row, updates);
  await row.save();
}
export async function updateSubmission(messageId, updatedRecord) {
  const sheet = await getSheet();

  const rows = await sheet.getRows();

  const row = rows.find(r => String(r.message_id) === String(messageId));

  if (!row) {
    console.log("⚠️ No existing row found, skipping update");
    return;
  }

  Object.entries(updatedRecord).forEach(([key, value]) => {
    if (key in row) {
      row[key] = value;
    }
  });

  await row.save();
  console.log("✅ Row updated:", messageId);
}
