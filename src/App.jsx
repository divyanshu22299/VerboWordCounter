import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { parsePdf } from "./parsers/pdfParser";

import { countWords } from "./utils/wordCounter";

import { parseTxt } from "./parsers/txtParser";
import { parseJson } from "./parsers/jsonParser";
import { parseXml } from "./parsers/xmlParser";
import { parseHtml } from "./parsers/htmlParser";
import { parseDocx } from "./parsers/docxParser";
import { parseXlsx } from "./parsers/xlsxParser";
import { parsePptx } from "./parsers/pptxParser";
import { parseTmx } from "./parsers/tmxParser";
import { parseXliff } from "./parsers/xliffParser";
import { parseSdlxliff } from "./parsers/sdlxliffParser";
import { parseTbx } from "./parsers/tbxParser";



function App() {
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");



  const exportToExcel = () => {
  const data = results.map((file) => ({
    "File Name": file.name,
    Type: file.type,
    Words: file.words,
    Characters: file.characters,
    Status: file.status,
  }));

  data.push({
    "File Name": "TOTAL",
    Type: "",
    Words: totalWords,
    Characters: totalCharacters,
    Status: "",
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Word Count Report"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "VerboWordCounter_Report.xlsx");
};



  const getParser = (extension) => {
    switch (extension) {
      case "pptx":
        return parsePptx;

      case "tmx":
        return parseTmx;

      case "xlf":
      case "xliff":
        return parseXliff;

      case "sdlxliff":
        return parseSdlxliff;

      case "tbx":
        return parseTbx;  


      case "txt":
      case "csv":
        return parseTxt;

      case "pdf":
        return parsePdf;

      case "json":
        return parseJson;

      case "xml":
        return parseXml;

      case "html":
      case "htm":
        return parseHtml;

      case "docx":
        return parseDocx;

      case "xlsx":
      case "xls":
        return parseXlsx;

      default:
        return null;
    }
  };

  const processFiles = async (files) => {
    setProcessing(true);
    setProcessedCount(0);
    setTotalFiles(files.length);

    const output = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "";

      const parser = getParser(extension);

      if (!parser) {
        output.push({
          name: file.name,
          type: extension.toUpperCase(),
          words: 0,
          characters: 0,
          status: "Unsupported",
        });

        setProcessedCount(i + 1);
        continue;
      }

      try {
        const text = await parser(file);

        const words = countWords(text);
        const characters = text.length;

        output.push({
          name: file.name,
          type: extension.toUpperCase(),
          words,
          characters,
          status: "Processed",
        });
      } catch (error) {
        output.push({
          name: file.name,
          type: extension.toUpperCase(),
          words: 0,
          characters: 0,
          status: "Error",
        });
      }

      setProcessedCount(i + 1);
    }

    setResults(output);
    setProcessing(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    processFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
    });

  const totalWords = results.reduce(
    (sum, item) => sum + item.words,
    0
  );

  const totalCharacters = results.reduce(
    (sum, item) => sum + (item.characters || 0),
    0
  );

  const filteredResults = [...results]
  .filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    switch (sortBy) {
      case "words":
        return b.words - a.words;

      case "characters":
        return b.characters - a.characters;

      case "type":
        return a.type.localeCompare(b.type);

      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="container">
      <h1>VerboWordCounter</h1>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />

        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <>
            <h3>Drag & Drop Files Here</h3>
            <p>or click to browse</p>
          </>
        )}
      </div>

      <div className="summary">
        <div className="card">
          <div className="card-title">Files</div>
          <div className="card-value">
            {results.length}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Words</div>
          <div className="card-value">
            {totalWords.toLocaleString()}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Characters</div>
          <div className="card-value">
            {totalCharacters.toLocaleString()}
          </div>
        </div>

        {processing && (
          <div className="card">
            <div className="card-title">
              Processing
            </div>
            <div className="card-value">
              {processedCount} / {totalFiles}
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
  <button
    onClick={exportToExcel}
    style={{
      padding: "10px 20px",
      marginBottom: "20px",
      cursor: "pointer",
    }}
  >
    Export to Excel
  </button>
)}

<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <input
    type="text"
    placeholder="Search file..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      padding: "10px",
      flex: 1,
    }}
  />

  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    style={{
      padding: "10px",
    }}
  >
    <option value="name">Sort by Name</option>
    <option value="words">Sort by Words</option>
    <option value="characters">Sort by Characters</option>
    <option value="type">Sort by Type</option>
  </select>
</div>

      {results.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Words</th>
                <th>Characters</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.type}</td>
                  <td>
                    {file.words.toLocaleString()}
                  </td>
                  <td>
                    {file.characters?.toLocaleString()}
                  </td>
                  <td>{file.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;