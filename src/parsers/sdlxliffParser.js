export async function parseSdlxliff(file) {
  const xmlText = await file.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(
    xmlText,
    "text/xml"
  );

  let text = "";

  xml.querySelectorAll("source").forEach((node) => {
    text += node.textContent + " ";
  });

  return text;
}