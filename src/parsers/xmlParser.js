export async function parseXml(file) {
  const xmlText = await file.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");

  return xml.documentElement.textContent || "";
}