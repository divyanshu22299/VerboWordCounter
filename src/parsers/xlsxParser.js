import * as XLSX from "xlsx";

export async function parseXlsx(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  let text = "";

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
    });

    rows.forEach((row) => {
      text += " " + row.join(" ");
    });
  });

  return text;
}