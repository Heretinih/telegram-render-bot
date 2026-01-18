// parser.js
import { normalizeRecord } from "./normalize.js";

export function parseTelegramUpdate(update) {
  const message =
    update.message ||
    update.edited_message ||
    null;

  if (!message) return null;

  if (!message.photo) return null;

  const record = normalizeRecord(message);

  if (update.edited_message) {
    record.edited = true;
  }

  return record;
}
