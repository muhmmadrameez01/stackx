import React, { useRef } from 'react';
import { UploadCloud, FileText, X, FileCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { generateSamplePDF } from '../services/pdfService';

interface DropzoneProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  toolName?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  files,
  onFilesAdded,
  onRemoveFile,
  accept = '.pdf',
  multiple = true,
  toolName = 'PDF',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesAdded(multiple ? droppedFiles : [droppedFiles[0]]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesAdded(multiple ? selectedFiles : [selectedFiles[0]]);
    }
  };

  const handleLoadSamplePdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const sampleFile1 = await generateSamplePDF();
      if (toolName?.toLowerCase().includes('merge')) {
        const sampleFile2 = await generateSamplePDF();
        const file2 = new File([sampleFile2], 'sample_demo_document_2.pdf', { type: 'application/pdf' });
        onFilesAdded([sampleFile1, file2]);
      } else {
        onFilesAdded([sampleFile1]);
      }
    } catch (err) {
      console.error('Failed to generate sample PDF:', err);
    }
  };

  return (
    <div className="w-full">
      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-red-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-3xl p-8 sm:p-12 text-center bg-red-50/30 dark:bg-slate-900/50 hover:bg-red-50/70 dark:hover:bg-slate-900/80 transition-all duration-200 cursor-pointer group shadow-inner"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
            className="hidden"
          />

          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/25 group-hover:scale-110 transition-transform duration-200 mb-6">
            <UploadCloud className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
            Select {toolName} files or drop them here
          </h3>

          <div className="flex items-center justify-center gap-2.5 max-w-md mx-auto mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 shadow-sm">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-left leading-snug">
              Your files never get uploaded to external servers. 100% Client-Side Privacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-red-500/25 transition-colors"
            >
              Select {toolName} Files
            </button>

            <button
              type="button"
              onClick={handleLoadSamplePdf}
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-red-500 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Try Sample Demo PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Selected Files ({files.length})
            </h4>
            {multiple && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                + Add More Files
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept}
              multiple={multiple}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
