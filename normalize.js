export function normalizeCaption(caption = "") {
  const clean = caption.trim();

  // Expected formats:
  // 1234567 - Outlet Name
  // 1234567 | Outlet Name
  // 1234567 Outlet Name

  const match = clean.match(/^(\d+)[\s\-|]+(.+)$/);

  if (!match) {
    return {
      outlet_id: "",
      outlet_name: "",
      normalized: clean
    };
  }

  return {
    outlet_id: match[1],
    outlet_name: match[2].trim(),
    normalized: `${match[1]} | ${match[2].trim()}`
  };
}
