export function countWords(text) {
  if (!text) return 0;

  const cleaned = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return 0;

  return cleaned.split(" ").length;
}