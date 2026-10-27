import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, RotateCcw, Archive, Sparkles } from 'lucide-react';
import { downloadFile, downloadFilesAsZip } from '../services/pdfService';

import type { ToolId } from '../types';

interface SuccessViewProps {
  toolId?: ToolId | null;
  toolName: string;
  processedBytes?: Uint8Array | null;
  processedFiles?: { name: string; data: Uint8Array }[];
  extractedText?: string;
  downloadFileName?: string;
  downloadMimeType?: string;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  toolId,
  toolName,
  processedBytes,
  processedFiles,
  extractedText,
  downloadFileName,
  downloadMimeType = 'application/pdf',
  onReset,
}) => {

  useEffect(() => {
    // Trigger celebratory confetti on completion
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleDownloadSingle = () => {
    console.log("handleDownloadSingle triggered", { hasBytes: !!processedBytes, byteLength: processedBytes?.byteLength, downloadFileName, downloadMimeType });
    if (processedBytes) {
      const defaultName = `processed_${toolName.toLowerCase().replace(/\s+/g, '_')}`;
      const name = downloadFileName || defaultName;
      console.log("Calling downloadFile with name:", name);
      try {
        downloadFile(processedBytes, name, downloadMimeType);
        console.log("downloadFile executed successfully");
      } catch (err) {
        console.error("Error in downloadFile:", err);
      }
    }
  };

  const handleDownloadZip = () => {
    if (processedFiles) {
      const zipName = downloadFileName ? `${downloadFileName}.zip` : `${toolName.toLowerCase().replace(/\s+/g, '_')}_files.zip`;
      downloadFilesAsZip(processedFiles, zipName);
    }
  };

  const getDownloadButtonText = () => {
    if (toolId) {
      switch (toolId) {
        case 'merge-pdf': return 'Download Merged PDF';
        case 'split-pdf': return 'Download Split PDF';
        case 'remove-pages': return 'Download Modified PDF';
        case 'extract-pages': return 'Download Extracted Pages';
        case 'organize-pdf': return 'Download Organized PDF';
        case 'rotate-pdf': return 'Download Rotated PDF';
        case 'watermark-pdf': return 'Download Watermarked PDF';
        case 'page-numbers': return 'Download Numbered PDF';
        case 'protect-pdf': return 'Download Protected PDF';
        case 'unlock-pdf': return 'Download Unlocked PDF';
        case 'compress-pdf': return 'Download Compressed PDF';
        case 'sign-pdf': return 'Download Signed PDF';
        case 'pdf-to-jpg': return 'Download JPG Images (.ZIP)';
        case 'pdf-to-word': return 'Download Word Document (.DOCX)';
        case 'pdf-to-excel': return 'Download Excel Spreadsheet (.XLSX)';
        case 'pdf-to-ppt': return 'Download PowerPoint Presentation (.PPTX)';
        case 'pdf-to-pdfa': return 'Download PDF/A Document';
        case 'jpg-to-pdf': return 'Download Converted PDF';
        case 'word-to-pdf': return 'Download Converted PDF';
        case 'excel-to-pdf': return 'Download Converted PDF';
        case 'ppt-to-pdf': return 'Download Converted PDF';
        case 'html-to-pdf': return 'Download Converted PDF';
        case 'ocr-pdf': return 'Download Searchable PDF';
        case 'repair-pdf': return 'Download Repaired PDF';
      }
    }

    if (downloadFileName) {
      const ext = downloadFileName.split('.').pop()?.toLowerCase();
      if (ext === 'docx') return 'Download Word Document (.DOCX)';
      if (ext === 'xlsx') return 'Download Excel Spreadsheet (.XLSX)';
      if (ext === 'pptx') return 'Download PowerPoint (.PPTX)';
      if (ext === 'txt') return 'Download Text File (.TXT)';
      if (ext === 'jpg' || ext === 'png') return `Download Image (.${ext.toUpperCase()})`;
      if (ext === 'zip') return 'Download Archive (.ZIP)';
      if (ext === 'pdf') return 'Download Processed PDF';
    }

    return `Download ${toolName}`;
  };

  return (
    <div className="w-full my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
      
      {/* Success Badge Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-6 shadow-inner animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        PDFs have been processed successfully!
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        Your task for <span className="font-bold text-red-500">{toolName}</span> is complete. Download your ready file below.
      </p>

      {/* OCR Extracted Text Box */}
      {extractedText && (
        <div className="w-full mb-6 text-left">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Extracted Text (OCR Result):
          </label>
          <textarea
            readOnly
            value={extractedText}
            className="w-full h-48 p-4 text-xs font-mono rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      )}

      {/* Main Download Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-8">
        {processedBytes && (
          <button
            type="button"
            onClick={handleDownloadSingle}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-base shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            {getDownloadButtonText()}
          </button>
        )}

        {processedFiles && processedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadZip}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Archive className="w-5 h-5" />
            Download All Files (ZIP)
          </button>
        )}
      </div>

      {/* Reset / Convert Another File */}
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Process another PDF or Tool
      </button>

    </div>
  );
};
