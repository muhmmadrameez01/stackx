"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ToolCard } from '../components/ToolCard';
import { Dropzone } from '../components/Dropzone';
import { PageGrid } from '../components/PageGrid';
import { ToolOptionsPanel } from '../components/ToolOptionsPanel';
import { SignatureModal } from '../components/SignatureModal';
import { SuccessView } from '../components/SuccessView';
import { FeaturesSection } from '../components/FeaturesSection';
import { NetworkToolWorkspace } from '../components/NetworkToolWorkspace';
import { VideoDownloaderWorkspace } from '../components/VideoDownloaderWorkspace';
import { BackgroundRemoverWorkspace } from '../components/BackgroundRemoverWorkspace';
import { ImageResizerWorkspace } from '../components/ImageResizerWorkspace';
import { ImageConverterWorkspace } from '../components/ImageConverterWorkspace';
import { ImageCropperWorkspace } from '../components/ImageCropperWorkspace';
import { ColorConverterWorkspace } from '../components/ColorConverterWorkspace';
import { TextToolsWorkspace } from '../components/TextToolsWorkspace';
import { SeoDevWorkspace } from '../components/SeoDevWorkspace';
import { CalculatorWorkspace } from '../components/CalculatorWorkspace';
import { QRGeneratorWorkspace } from '../components/QRGeneratorWorkspace';
import { Footer } from '../components/Footer';

import { TOOLS } from '../config/tools';
import type { ToolId, CategoryId, PDFPageMeta, WatermarkOptions, PageNumberOptions } from '../types';
import {
  mergePDFs,
  splitPDF,
  removePages,
  extractPages,
  rotatePDF,
  organizePDF,
  watermarkPDF,
  addPageNumbers,
  protectPDF,
  unlockPDF,
  compressPDF,
  imagesToPDF,
  pdfToImages,
  getPDFPagesMeta,
  signPDF,
  performOCR,
  convertPDFToWord,
  convertPDFToExcel,
  convertPDFToPPT,
  convertDocumentToPDF,
  repairPDF,
} from '../services/pdfService';

import { ArrowLeft, Play, Loader2, AlertCircle, X, Search } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stackx_theme') || localStorage.getItem('tools726_theme');
      if (saved !== null) return saved === 'dark';
      return true; // Default to dark mode
    }
    return true; // Default to dark mode for SSR
  });
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File & Page states
  const [files, setFiles] = useState<File[]>([]);
  const [pageMetas, setPageMetas] = useState<PDFPageMeta[]>([]);
  const [selectedPageIndexList, setSelectedPageIndexList] = useState<number[]>([]);

  // Tool option states
  const [splitRange, setSplitRange] = useState<string>('');
  const [watermarkOpts, setWatermarkOpts] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    opacity: 0.4,
    fontSize: 40,
    color: '#e5322d',
    position: 'center',
    rotation: 45,
    overContent: true,
  });
  const [pageNumberOpts, setPageNumberOpts] = useState<PageNumberOptions>({
    position: 'bottom-center',
    format: 'page-n-of-x',
    fontSize: 12,
    fontColor: '#333333',
    startFrom: 1,
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [imageFitOpts, setImageFitOpts] = useState<{ orientation: 'portrait' | 'landscape'; margin: number; fit: boolean }>({
    orientation: 'portrait',
    margin: 20,
    fit: true,
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);


  // Processing & Results states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [_processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [resultFiles, setResultFiles] = useState<{ name: string; data: Uint8Array }[] | null>(null);
  const [extractedText, setExtractedText] = useState<string | undefined>(undefined);
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [outputMimeType, setOutputMimeType] = useState<string>('application/pdf');

  // Sync dark mode class with root html element and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('stackx_theme', 'dark'); } catch (_e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('stackx_theme', 'light'); } catch (_e) {}
    }
  }, [darkMode]);

  // Load PDF page thumbnails whenever first file changes for visual tools
  useEffect(() => {
    if (files.length > 0 && files[0].type === 'application/pdf') {
      getPDFPagesMeta(files[0])
        .then((metas) => setPageMetas(metas))
        .catch((err) => console.error('Failed to parse PDF page thumbs:', err));
    } else {
      setPageMetas([]);
    }
  }, [files]);

  const activeTool = TOOLS.find((t) => t.id === selectedToolId);

  // Filter tools for grid display
  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetTool = () => {
    setFiles([]);
    setPageMetas([]);
    setSelectedPageIndexList([]);
    setResultBytes(null);
    setResultFiles(null);
    setExtractedText(undefined);
    setOutputFileName('');
    setOutputMimeType('application/pdf');
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleSelectTool = (id: ToolId | null) => {
    setSelectedToolId(id);
    handleResetTool();
  };

  // Main Processing Handler for all 27 Tools
  const handleProcessTool = async () => {
    if (!selectedToolId) return;
    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingStatus('Processing PDF document...');
    setErrorMessage(null);

    const firstFileName = files[0]?.name || 'document';
    const baseName = firstFileName.replace(/\.[^/.]+$/, '');

    try {
      if (selectedToolId === 'merge-pdf') {
        if (files.length < 2) {
          throw new Error('Please select at least 2 PDF files to merge.');
        }
        const bytes = await mergePDFs(files);
        setResultBytes(bytes);
        setOutputFileName('merged_document.pdf');
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'split-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const splitResults = await splitPDF(files[0], splitRange);
        if (splitResults.length === 1) {
          setResultBytes(splitResults[0].data);
          setOutputFileName(`${baseName}_split.pdf`);
          setOutputMimeType('application/pdf');
        } else {
          setResultFiles(splitResults);
          setOutputFileName(`${baseName}_split_pages.zip`);
          setOutputMimeType('application/zip');
        }
      } else if (selectedToolId === 'remove-pages') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        
        // Combine explicitly selected indexes AND pages removed via Trash icon in PageGrid
        const maxOriginal = pageMetas.length > 0 ? Math.max(...pageMetas.map(p => p.originalIndex)) : 0;
        const remainingOriginalIndexes = new Set(pageMetas.map(p => p.originalIndex));
        const removedViaTrash: number[] = [];
        for (let i = 0; i <= maxOriginal; i++) {
          if (!remainingOriginalIndexes.has(i)) {
            removedViaTrash.push(i);
          }
        }
        const allIndexesToRemove = Array.from(new Set([...selectedPageIndexList, ...removedViaTrash]));
        if (allIndexesToRemove.length === 0) {
          throw new Error('Please click on a page thumbnail or click the delete icon to select pages to remove.');
        }
        const bytes = await removePages(files[0], allIndexesToRemove);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_pages_removed.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'extract-pages') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        if (selectedPageIndexList.length === 0) {
          throw new Error('Please click on page thumbnails to select pages to extract.');
        }
        const bytes = await extractPages(files[0], selectedPageIndexList);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_extracted.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'organize-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await organizePDF(files[0], pageMetas);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_organized.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'rotate-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await rotatePDF(files[0], 90, selectedPageIndexList.length > 0 ? selectedPageIndexList : undefined);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_rotated.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'watermark-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await watermarkPDF(files[0], watermarkOpts);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_watermarked.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'page-numbers') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await addPageNumbers(files[0], pageNumberOpts);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_numbered.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'protect-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        if (!passwordInput.trim()) throw new Error('Please enter a password to protect the PDF.');
        const bytes = await protectPDF(files[0], passwordInput, passwordInput);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_protected.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'unlock-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        if (!passwordInput.trim()) throw new Error('Please enter the unlock password.');
        const bytes = await unlockPDF(files[0], passwordInput);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_unlocked.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'compress-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await compressPDF(files[0], compressLevel);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_compressed.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'jpg-to-pdf') {
        if (files.length === 0) throw new Error('Please select at least 1 image file.');
        const bytes = await imagesToPDF(files, imageFitOpts);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_converted.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'pdf-to-jpg') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const images = await pdfToImages(files[0], 'jpg', 2.0);
        // Package images as downloadable files
        const filesList = images.map((img, i) => {
          const base64Data = img.dataUrl.split(',')[1];
          const binary = atob(base64Data);
          const bytes = new Uint8Array(binary.length);
          for (let b = 0; b < binary.length; b++) bytes[b] = binary.charCodeAt(b);
          return { name: `${baseName}_page_${i + 1}.jpg`, data: bytes };
        });
        setResultFiles(filesList);
        setOutputFileName(`${baseName}_images.zip`);
        setOutputMimeType('application/zip');
      } else if (selectedToolId === 'sign-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        if (!signatureDataUrl) throw new Error('Please create a signature first.');
        const bytes = await signPDF(files[0], signatureDataUrl, 0, { x: 100, y: 100, width: 180, height: 75 });
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_signed.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'ocr-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const ocrRes = await performOCR(files[0], (p, status) => {
          setProcessingProgress(p);
          setProcessingStatus(status);
        });
        setExtractedText(ocrRes.text);
        const encoder = new TextEncoder();
        setResultBytes(encoder.encode(ocrRes.text));
        setOutputFileName(`${baseName}_ocr_text.txt`);
        setOutputMimeType('text/plain');
      } else if (selectedToolId === 'pdf-to-word') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await convertPDFToWord(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_converted.docx`);
        setOutputMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else if (selectedToolId === 'pdf-to-excel') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await convertPDFToExcel(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_converted.xlsx`);
        setOutputMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else if (selectedToolId === 'pdf-to-ppt') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await convertPDFToPPT(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_converted.pptx`);
        setOutputMimeType('application/vnd.openxmlformats-officedocument.presentationml.presentation');
      } else if (selectedToolId === 'repair-pdf') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await repairPDF(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_repaired.pdf`);
        setOutputMimeType('application/pdf');
      } else if (selectedToolId === 'pdf-to-pdfa') {
        if (files.length === 0) throw new Error('Please upload a PDF file.');
        const bytes = await convertDocumentToPDF(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_pdfa.pdf`);
        setOutputMimeType('application/pdf');
      } else if (
        selectedToolId === 'word-to-pdf' ||
        selectedToolId === 'excel-to-pdf' ||
        selectedToolId === 'ppt-to-pdf' ||
        selectedToolId === 'html-to-pdf'
      ) {
        if (files.length === 0) throw new Error('Please upload a document file.');
        const bytes = await convertDocumentToPDF(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_converted.pdf`);
        setOutputMimeType('application/pdf');
      } else {
        // Fallback processing for general conversions
        if (files.length === 0) throw new Error('Please upload a file.');
        const bytes = await convertDocumentToPDF(files[0]);
        setResultBytes(bytes);
        setOutputFileName(`${baseName}_converted.pdf`);
        setOutputMimeType('application/pdf');
      }

      setProcessingProgress(100);
    } catch (err: any) {
      console.error('Error executing tool:', err);
      setErrorMessage(err.message || 'Failed to process file. Please check file format or permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar
        onSelectTool={handleSelectTool}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={(dataUrl) => setSignatureDataUrl(dataUrl)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {!selectedToolId ? (
          /* Home Grid Mode */
          <>
            <Hero
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onClearSearch={() => setSearchQuery('')}
            />

            {/* Active Search Indicator Banner */}
            {searchQuery && (
              <div className="max-w-xl mx-auto mb-6 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-500" />
                  Showing tools matching "<span className="font-bold text-slate-900 dark:text-white">{searchQuery}</span>" ({filteredTools.length} found)
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold text-[11px] flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Show All Tools
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={handleSelectTool}
                />
              ))}
            </div>
          </>
        ) : (
          /* Single Tool Active Workspace Mode */
          <div className="max-w-6xl mx-auto">
            
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => handleSelectTool(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Tools
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Category:</span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900">
                  {activeTool?.category}
                </span>
              </div>
            </div>

            {/* Tool Title Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
                {activeTool?.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                {activeTool?.fullDescription}
              </p>
            </div>

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Network & Security Workspace */}
            {activeTool?.category === 'network-security' ? (
              <NetworkToolWorkspace toolId={selectedToolId} toolName={activeTool.name} />
            ) : selectedToolId === 'image-background-remover' ? (
              <BackgroundRemoverWorkspace />
            ) : selectedToolId === 'image-resizer' ? (
              <ImageResizerWorkspace />
            ) : selectedToolId === 'image-converter' ? (
              <ImageConverterWorkspace />
            ) : selectedToolId === 'image-cropper' ? (
              <ImageCropperWorkspace />
            ) : selectedToolId === 'color-converter' ? (
              <ColorConverterWorkspace />
            ) : activeTool?.category === 'text-tools' ? (
              <TextToolsWorkspace toolId={selectedToolId} />
            ) : activeTool?.category === 'seo-tools' ? (
              <SeoDevWorkspace toolId={selectedToolId} />
            ) : activeTool?.category === 'calculators' ? (
              <CalculatorWorkspace toolId={selectedToolId} />
            ) : selectedToolId === 'qr-generator' ? (
              <QRGeneratorWorkspace />
            ) : activeTool?.category === 'media-tools' ? (
              <VideoDownloaderWorkspace toolId={selectedToolId} />
            ) : (resultBytes || resultFiles || extractedText) ? (
              <SuccessView
                toolId={selectedToolId}
                toolName={activeTool?.name || 'PDF'}
                processedBytes={resultBytes}
                processedFiles={resultFiles || undefined}
                extractedText={extractedText}
                downloadFileName={outputFileName}
                downloadMimeType={outputMimeType}
                onReset={handleResetTool}
              />
            ) : (
              /* Upload & Processing Workspace */
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                
                {/* File Dropzone */}
                <Dropzone
                  files={files}
                  onFilesAdded={handleFilesAdded}
                  onRemoveFile={handleRemoveFile}
                  accept={activeTool?.accept || '.pdf'}
                  multiple={activeTool?.multiple ?? true}
                  toolName={activeTool?.name || 'PDF'}
                />

                {/* Visual Page Thumbnail Grid */}
                {files.length > 0 && pageMetas.length > 0 && ['organize-pdf', 'remove-pages', 'rotate-pdf', 'extract-pages'].includes(selectedToolId) && (
                  <PageGrid
                    pages={pageMetas}
                    selectedIndexes={selectedPageIndexList}
                    onToggleSelect={(idx) => {
                      setSelectedPageIndexList((prev) =>
                        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                      );
                    }}
                    onRotatePage={(idx) => {
                      setPageMetas((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
                      );
                    }}
                    onRemovePage={(idx) => {
                      setPageMetas((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    onMovePage={(from, to) => {
                      setPageMetas((prev) => {
                        const next = [...prev];
                        const [moved] = next.splice(from, 1);
                        next.splice(to, 0, moved);
                        return next;
                      });
                    }}
                  />
                )}

                {/* Specific Tool Options Controls */}
                {files.length > 0 && (
                  <ToolOptionsPanel
                    toolId={selectedToolId}
                    splitRange={splitRange}
                    onSplitRangeChange={setSplitRange}
                    watermarkOpts={watermarkOpts}
                    onWatermarkOptsChange={setWatermarkOpts}
                    pageNumberOpts={pageNumberOpts}
                    onPageNumberOptsChange={setPageNumberOpts}
                    passwordInput={passwordInput}
                    onPasswordInputChange={setPasswordInput}
                    compressLevel={compressLevel}
                    onCompressLevelChange={setCompressLevel}
                    imageFitOpts={imageFitOpts}
                    onImageFitOptsChange={setImageFitOpts}
                    signatureDataUrl={signatureDataUrl}
                    onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                  />
                )}

                {/* Bottom Main Action Button */}
                {files.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleResetTool}
                      className="text-xs font-bold text-slate-500 hover:text-red-500"
                    >
                      Clear All Files
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleProcessTool}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-base shadow-xl shadow-red-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{processingStatus || 'Processing...'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span>Process {activeTool?.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Home Page Features & How It Works Sections */}
      {!selectedToolId && <FeaturesSection />}

      {/* Footer */}
      <Footer onSelectTool={handleSelectTool} />

    </div>
  );
}
