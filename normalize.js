export function normalizeCaption(caption = "") {
  const clean = caption.trim();

  if (!clean) {
    return {
      outlet_id: "Required",
      outlet_name: "Required",
      salesman_id: "Required",
      caption_normalized: "Required"
    };
  }

  const idName = clean.match(/(\d{5,})\s*[-|]\s*(.+)|(.+)\s*[-|]\s*(\d{5,})/);

  let outlet_id = "Required";
  let outlet_name = "Required";

  if (idName) {
    outlet_id = idName[1] || idName[4];
    outlet_name = idName[2] || idName[3];
  }

  return {
    outlet_id,
    outlet_name,
    salesman_id: "Required",
    caption_normalized: `${outlet_id} - ${outlet_name}`
  };
}
