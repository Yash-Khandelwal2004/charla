"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onExtract: (text: string) => void;
  label?: string;
}

const FileUpload = ({ onExtract, label = "Upload PDF or Word file" }: FileUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    return fullText.trim();
  };

  const extractFromDocx = async (file: File): Promise<string> => {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  };

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    setFileName(file.name);

    try {
      let text = "";
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "pdf") {
        text = await extractFromPdf(file);
      } else if (ext === "docx") {
        text = await extractFromDocx(file);
      } else if (ext === "doc") {
        throw new Error("Old .doc format isn't supported — please use .docx or .pdf");
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
      }

      if (!text || text.length < 10) {
        throw new Error("Couldn't extract text from this file. It may be scanned/image-based.");
      }

      onExtract(text);
    } catch (err: any) {
      setError(err.message || "Failed to read file");
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
        style={{
          border: `1.5px dashed ${
            error
              ? "var(--color-danger)"
              : dragActive
              ? "var(--accent)"
              : "var(--border-default)"
          }`,
          backgroundColor: dragActive ? "var(--accent-muted)" : "var(--bg-overlay)",
          padding: "28px 20px",
          minHeight: "120px",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={onFileChange}
          className="hidden"
        />

        {loading ? (
          <>
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Extracting text...
            </span>
          </>
        ) : fileName ? (
          <>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-muted)" }}
            >
              <FileText size={20} style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex items-center gap-2 max-w-full">
              <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {fileName}
              </span>
              <button
                onClick={clear}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-150"
                style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-tertiary)" }}
              >
                <X size={12} />
              </button>
            </div>
            <span className="text-xs" style={{ color: "var(--color-success)" }}>
              ✓ Text extracted successfully
            </span>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-subtle)" }}
            >
              <Upload size={20} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {label}
              </span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Drag and drop or click to browse
              </span>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-danger)" }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;