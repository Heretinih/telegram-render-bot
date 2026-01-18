import { v4 as uuid } from "uuid";
import { normalizeCaption } from "./normalize.js";

export function parseTelegram(update) {
  const msg =
    update.message ||
    update.edited_message ||
    update.channel_post ||
    update.edited_channel_post;

  if (!msg) return null;

  const photos = msg.photo || [];
  const largestPhoto = photos.at(-1);

  const caption = msg.caption || "";

  const normalized = normalizeCaption(caption);

  return {
    record_id: uuid(),
    telegram_message_id: msg.message_id,
    chat_id: msg.chat?.id,
    chat_title: msg.chat?.title || "",
    sender_id: msg.from?.id,
    sender_username: msg.from?.username || "",
    original_sender_id: msg.forward_from?.id || "",
    original_sender_username: msg.forward_from?.username || "",
    salesman_id: normalized.salesman_id,
    outlet_id: normalized.outlet_id,
    outlet_name: normalized.outlet_name,
    caption_raw: caption || "Required",
    caption_normalized: normalized.caption_normalized,
    photo_count: photos.length,
    photo_file_ids: photos.map(p => p.file_id).join(","),
    photo_taken_time: null,
    telegram_sent_time: new Date(msg.date * 1000).toISOString(),
    location_lat: msg.location?.latitude || "",
    location_lng: msg.location?.longitude || "",
    location_status: msg.location ? "OK" : "Required",
    edit_status: update.edited_message ? "EDITED" : "NEW",
    edited_by: update.edited_message ? msg.from?.username : "",
    edited_at: update.edited_message ? new Date().toISOString() : "",
    created_at: new Date().toISOString()
  };
}
