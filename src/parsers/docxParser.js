import mammoth from "mammoth";

export async function parseDocx(file) {
  const buffer = await file.arrayBuffer();

  const result = await mammoth.extractRawText({
    arrayBuffer: buffer,
  });

  console.log(result.value);

  return result.value;
}