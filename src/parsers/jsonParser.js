function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function extractText(node, results) {
  if (!node) return;

  if (typeof node === "string") {
    results.push(stripHtml(node));
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item) => extractText(item, results));
    return;
  }

  if (typeof node === "object") {
    if (
      node.fieldValues &&
      typeof node.fieldValues.value === "string"
    ) {
      results.push(
        stripHtml(node.fieldValues.value)
      );
    }

    if (typeof node.title === "string") {
      results.push(node.title);
    }

    if (typeof node.source === "string") {
      results.push(node.source);
    }

    Object.values(node).forEach((value) => {
      if (
        typeof value === "object" ||
        Array.isArray(value)
      ) {
        extractText(value, results);
      }
    });
  }
}

export async function parseJson(file) {
  const content = await file.text();
  const json = JSON.parse(content);

  const results = [];

  extractText(json, results);

  return results.join(" ");
}