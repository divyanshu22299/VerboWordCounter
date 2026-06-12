import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { countWords } from "./utils/wordCounter";

import { parsePdf } from "./parsers/pdfParser";
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

// Icons
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconType = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IconWords = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>;
const IconChars = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16h16"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconUpload = ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconLogo = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;


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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Word Count Report");

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
      case "pptx": return parsePptx;
      case "tmx": return parseTmx;
      case "xlf":
      case "xliff": return parseXliff;
      case "sdlxliff": return parseSdlxliff;
      case "tbx": return parseTbx;  
      case "txt":
      case "csv": return parseTxt;
      case "pdf": return parsePdf;
      case "json": return parseJson;
      case "xml": return parseXml;
      case "html":
      case "htm": return parseHtml;
      case "docx": return parseDocx;
      case "xlsx":
      case "xls": return parseXlsx;
      default: return null;
    }
  };

  const processFiles = async (files) => {
    setProcessing(true);
    setProcessedCount(0);
    setTotalFiles(files.length);

    const output = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
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

    setResults(prev => [...prev, ...output]);
    setProcessing(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    processFiles(acceptedFiles);
  }, []);

  const { 
    getRootProps: getEmptyRootProps, 
    getInputProps: getEmptyInputProps, 
    isDragActive: isEmptyDragActive 
  } = useDropzone({ onDrop });

  const { 
    getRootProps: getSidebarRootProps, 
    getInputProps: getSidebarInputProps, 
    isDragActive: isSidebarDragActive, 
    open: openSidebar 
  } = useDropzone({ onDrop });

  const totalWords = results.reduce((sum, item) => sum + item.words, 0);
  const totalCharacters = results.reduce((sum, item) => sum + (item.characters || 0), 0);

  const filteredResults = [...results]
    .filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "words": return b.words - a.words;
        case "characters": return b.characters - a.characters;
        case "type": return a.type.localeCompare(b.type);
        default: return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className={`container ${results.length === 0 ? "empty" : ""}`}>
      <header className="header">
        <div className="logo">
          <div className="logo-icon-wrap">
            <IconLogo />
          </div>
          <div>
            <div className="app-title">VerboWordCounter</div>
            <div className="app-sub">Fast, beautiful file word counts</div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={openSidebar} className="btn ghost">
              <IconUpload size={18} /> Add More
            </button>
            <button onClick={() => setResults([])} className="btn ghost" style={{ color: '#f87171' }}>
              Clear All
            </button>
            <button onClick={exportToExcel} className="btn primary">
              <IconDownload /> Export
            </button>
          </div>
        )}
      </header>

      <div className="app-grid">
        <aside className="sidebar">
          <div {...getSidebarRootProps()} className={`card dropzone ${isSidebarDragActive ? 'active' : ''}`}>
            <input {...getSidebarInputProps()} />
            <div className="drop-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <IconUpload size={32} />
            </div>
            {isSidebarDragActive ? (
              <h3>Drop files here...</h3>
            ) : (
              <>
                <h3>Upload Files</h3>
                <p>Drag & drop or click to browse</p>
              </>
            )}
          </div>

          <div className="summary-cards">
            <div className="card stat-card">
              <div className="stat-icon"><IconFile /></div>
              <div className="stat-info">
                <span className="stat-label">Total Files</span>
                <span className="stat-value">{results.length}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon"><IconWords /></div>
              <div className="stat-info">
                <span className="stat-label">Total Words</span>
                <span className="stat-value">{totalWords.toLocaleString()}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon"><IconChars /></div>
              <div className="stat-info">
                <span className="stat-label">Total Characters</span>
                <span className="stat-value">{totalCharacters.toLocaleString()}</span>
              </div>
            </div>

            {processing && (
              <div className="card stat-card">
                <div className="stat-icon"><IconType /></div>
                <div className="stat-info">
                  <span className="stat-label">Processing</span>
                  <span className="stat-value">{processedCount} / {totalFiles}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="main">
          {results.length > 0 ? (
            <>
              <div className="controls">
                <div className="input-group">
                  <div className="input-icon"><IconSearch /></div>
                  <input
                    className="input"
                    type="text"
                    placeholder="Search files by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: '220px' }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="words">Sort by Words</option>
                  <option value="characters">Sort by Characters</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>

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
                        <td>
                          <div className="file-name-cell">
                            <span className="file-icon"><IconFile /></span>
                            <span className="file-name-text" title={file.name}>{file.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="type-badge">{file.type}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{file.words.toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{file.characters?.toLocaleString()}</td>
                        <td>
                          <span className={"status " + file.status.toLowerCase()}>
                            <span className="status-dot"></span>
                            {file.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div {...getEmptyRootProps()} className={`empty-state ${isEmptyDragActive ? 'drag-active' : ''}`}>
              <input {...getEmptyInputProps()} />
              
              <div className="empty-state-content">
                <div className="empty-icon-wrap">
                  <div className="empty-icon-glow"></div>
                  <div className="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                </div>
                
                <div className="empty-state-text">
                  <h3>{isEmptyDragActive ? "Drop files to begin" : "Upload your documents"}</h3>
                  <p>Drag and drop your files here, or click to browse. We support Word, PDF, Excel, Text, JSON, and many more formats.</p>
                </div>
                
                <div className="empty-state-action">
                  <button className="btn primary" type="button">
                    <IconUpload /> Browse Files
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;