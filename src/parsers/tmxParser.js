export async function parseTmx(file) {
  const xmlText = await file.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(
    xmlText,
    "text/xml"
  );

  let text = "";

  xml.querySelectorAll("seg").forEach((seg) => {
    text += seg.textContent + " ";
  });

  return text;
}