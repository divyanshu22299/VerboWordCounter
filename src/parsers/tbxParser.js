export async function parseTbx(file) {
  const xmlText = await file.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(
    xmlText,
    "text/xml"
  );

  let text = "";

  xml.querySelectorAll("term").forEach((node) => {
    text += node.textContent + " ";
  });

  return text;
}