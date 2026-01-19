import { GoogleSpreadsheet } from 'google-spreadsheet';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

async function getSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: creds.client_email,
    private_key: creds.private_key,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['Submissions'];
  if (!sheet) {
    throw new Error('Sheet "Submissions" not found');
  }

  return sheet;
}

export async function appendSubmission(record) {
  const sheet = await getSheet();

  console.log('Sheet title:', sheet.title);
  console.log('Appending row for message_id:', record.message_id);

  await sheet.addRow({
    record_type: 'NEW',
    message_id: record.message_id,
    telegram_time: record.telegram_date,
    group_id: record.group_id,
    group_name: record.group_name,
    salesman_id: record.salesman_id,
    salesman_username: record.salesman_username,
    outlet_id: record.outlet_id,
    outlet_name: record.outlet_name,
    caption_raw: record.caption_raw,
    caption_normalized: record.caption_normalized,
    photo_count: record.photo_count,
    location_lat: record.latitude,
    location_lng: record.longitude,
    location_status: record.latitude === 'REQUIRED' ? 'REQUIRED' : 'OK',
    edited: false,
    created_at: record.received_at
  });
}

export async function updateRowByMessageId(messageId, updates) {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  const row = rows.find(r => String(r.message_id) === String(messageId));
  if (!row) return;

  Object.entries(updates).forEach(([k, v]) => {
    row[k] = v;
  });

  row.edited = true;
  row.edited_at = new Date().toISOString();

  await row.save();
}
