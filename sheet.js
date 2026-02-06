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
