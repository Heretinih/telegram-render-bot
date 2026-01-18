import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

// Create JWT auth client (v4+ REQUIRED)
const auth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SHEET_ID, auth);

async function getSheet() {
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['Submissions'];
  if (!sheet) {
    throw new Error('Sheet "Submissions" not found');
  }
  return sheet;
}

/**
 * Append new submission
 */
export async function appendSubmission(record) {
  const sheet = await getSheet();

  await sheet.addRow({
    received_at: record.received_at,
    telegram_date: record.telegram_date,
    edited: record.edited,
    edited_at: '',
    edited_by: '',
    group_id: record.group_id,
    group_name: record.group_name,
    message_id: record.message_id,
    salesman_username: record.salesman_username,
    salesman_id: record.salesman_id,
    outlet_id: record.outlet_id,
    outlet_name: record.outlet_name,
    caption_raw: record.caption_raw,
    caption_normalized: record.caption_normalized,
    photo_file_id: record.photo_file_id,
    photo_width: record.photo_width,
    photo_height: record.photo_height,
    photo_count: record.photo_count,
    latitude: record.latitude,
    longitude: record.longitude
  });
}

/**
 * Update existing submission by message_id + group_id
 */
export async function updateSubmission(record) {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  const row = rows.find(r =>
    String(r.message_id) === String(record.message_id) &&
    String(r.group_id) === String(record.group_id)
  );

  if (!row) {
    console.warn('Edit received but no matching row found');
    return;
  }

  row.edited = true;
  row.edited_at = record.edited_at;
  row.edited_by = record.edited_by;

  row.caption_raw = record.caption_raw;
  row.caption_normalized = record.caption_normalized;
  row.outlet_id = record.outlet_id;
  row.outlet_name = record.outlet_name;
  row.salesman_id = record.salesman_id;

  await row.save();
}
