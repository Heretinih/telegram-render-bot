/**
 * Normalize caption text into outlet_id + outlet_name
 * Accepts:
 *   - 1234567 - Sreyvin
 *   - Sreyvin - 1234567
 */
function normalizeCaption(raw = '') {
  const text = raw.trim();

  if (!text) {
    return {
      outlet_id: 'Required',
      outlet_name: 'Required',
      caption: 'Required',
    };
  }

  const parts = text.split('-').map(p => p.trim());

  if (parts.length !== 2) {
    return {
      outlet_id: 'Required',
      outlet_name: 'Required',
      caption: text,
    };
  }

  const [a, b] = parts;

  const isANumber = /^\d+$/.test(a);
  const isBNumber = /^\d+$/.test(b);

  if (isANumber && !isBNumber) {
    return { outlet_id: a, outlet_name: b, caption: text };
  }

  if (!isANumber && isBNumber) {
    return { outlet_id: b, outlet_name: a, caption: text };
  }

  return {
    outlet_id: 'Required',
    outlet_name: 'Required',
    caption: text,
  };
}

/**
 * MAIN EXPORT — used by server.js
 */
export function normalizeRecord(parsed) {
  const now = new Date().toISOString();
  const captionNorm = normalizeCaption(parsed.caption_raw || '');

  return {
    message_id: String(parsed.message_id),
    chat_id: String(parsed.chat_id),
    chat_title: parsed.chat_title || '',
    username: parsed.username || '',
    user_id: parsed.user_id || '',

    // Outlet
    outlet_id: captionNorm.outlet_id,
    outlet_name: captionNorm.outlet_name,

    // Salesman
    salesman_id: parsed.salesman_id || parsed.user_id || '',

    // Photos
    photo_count: parsed.photo_count || 0,
    photo_file_ids: parsed.photo_file_ids?.join(',') || '',
    photo_width: parsed.photo_width || '',
    photo_height: parsed.photo_height || '',
    photo_size: parsed.photo_size || '',

    // Caption
    caption_raw: parsed.caption_raw || '',
    caption: captionNorm.caption,

    // Location
    latitude: parsed.latitude ?? 'Required',
    longitude: parsed.longitude ?? 'Required',

    // Forwarding
    is_forwarded: parsed.is_forwarded ? 'YES' : 'NO',
    original_sender: parsed.original_sender || '',

    // Audit
    created_at: now,
    edited_at: '',
    edited_by: '',
  };
}
