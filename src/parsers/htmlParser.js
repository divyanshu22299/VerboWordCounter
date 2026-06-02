export async function parseHtml(file) {
  const html = await file.text();

  const div = document.createElement("div");
  div.innerHTML = html;

  return div.textContent || div.innerText || "";
}