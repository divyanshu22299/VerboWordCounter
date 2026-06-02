import JSZip from "jszip";

export async function parsePptx(file) {
  const buffer = await file.arrayBuffer();

  const zip = await JSZip.loadAsync(buffer);

  let text = "";

  const slideFiles = Object.keys(zip.files).filter(
    (name) =>
      name.startsWith("ppt/slides/slide") &&
      name.endsWith(".xml")
  );

  for (const slideFile of slideFiles) {
    const xml = await zip.files[slideFile].async("string");

    const matches = xml.match(/<a:t>(.*?)<\/a:t>/g);

    if (matches) {
      text += matches
        .map((m) =>
          m
            .replace("<a:t>", "")
            .replace("</a:t>", "")
        )
        .join(" ");
    }
  }

  return text;
}