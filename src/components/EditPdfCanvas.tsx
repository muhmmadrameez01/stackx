import React, { useState, useEffect, useRef } from 'react';
import type { PDFAnnotation, PDFPageMeta } from '../types';
import { getPDFPageTextItems } from '../services/pdfService';
import type { ExtractedTextItem } from '../services/pdfService';
import { 
  Type, 
  PenTool, 
  Square, 
  Circle as CircleIcon, 
  Highlighter, 
  Stamp, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn, 
  ZoomOut, 
  Move,
  Upload,
  Edit3,
  Layers,
  Eraser,
  Maximize2,
  Check,
  Plus
} from 'lucide-react';

interface EditPdfCanvasProps {
  files?: File[];
  pages: PDFPageMeta[];
  annotations: PDFAnnotation[];
  onAddAnnotation: (ann: PDFAnnotation) => void;
  onRemoveAnnotation: (id: string) => void;
  onUpdateAnnotation: (id: string, updates: Partial<PDFAnnotation>) => void;
}

export const EditPdfCanvas: React.FC<EditPdfCanvasProps> = ({
  files,
  pages,
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [toolMode, setToolMode] = useState<'editText' | 'move' | 'text' | 'draw' | 'rect' | 'circle' | 'highlight' | 'stamp' | 'image' | 'whiteout'>('editText');
  
  // Selected Annotation ID for Right Sidebar Text Formatting (iLovePDF Style)
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);

  // Global & Context Styling state
  const [drawColor, setDrawColor] = useState<string>('#111827');
  const [inputText, setInputText] = useState<string>('New Text');
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>('Helvetica');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [selectedStamp, setSelectedStamp] = useState<string>('APPROVED');
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Extracted Original Text Items
  const [originalTextItems, setOriginalTextItems] = useState<ExtractedTextItem[]>([]);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);

  // Track hidden original text items that have been clicked for editing
  const [hiddenTextIds, setHiddenTextIds] = useState<Set<string>>(new Set());

  // Dragging state
  const [draggingAnnId, setDraggingAnnId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDrawing = useRef<boolean>(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Map from annotation ID → original fontSize in viewport pixels for rendering
  const [editFontSizePxMap, setEditFontSizePxMap] = useState<Record<string, number>>({});

  // Color Swatches
  const colorSwatches = [
    '#111827', // Dark / Black
    '#1e3a8a', // Dark Blue
    '#2563eb', // Royal Blue
    '#dc2626', // Red
    '#16a34a', // Green
    '#7c3aed', // Purple
    '#d97706', // Amber
    '#4b5563', // Grey
    '#ffffff', // White
  ];

  // Load original PDF text items when page changes or file uploads
  useEffect(() => {
    if (files && files[0] && files[0].type === 'application/pdf') {
      getPDFPageTextItems(files[0], currentPage, 1.8)
        .then((res) => setOriginalTextItems(res.items))
        .catch((err) => console.error('Failed to extract PDF text items:', err));
    }
  }, [files, currentPage]);

  if (pages.length === 0) return null;

  // Selected annotation object reference
  const selectedAnn = annotations.find((a) => a.id === selectedAnnId);

  // Helper to update selected annotation properties in-place
  const updateSelectedAnnProps = (props: Partial<PDFAnnotation>, newPxFontSize?: number) => {
    if (!selectedAnnId) return;
    onUpdateAnnotation(selectedAnnId, { ...props, isUnmodifiedOriginal: false });
    if (newPxFontSize && selectedAnnId) {
      setEditFontSizePxMap((prev) => ({ ...prev, [selectedAnnId]: newPxFontSize }));
    }
    // Force re-render
    setSelectedAnnId((prev) => (prev === selectedAnnId ? `${selectedAnnId}` : selectedAnnId));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;

    // Deselect selected annotation if clicking blank canvas area
    if ((e.target as HTMLElement).tagName === 'IMG' || (e.target as HTMLElement).classList.contains('cursor-crosshair')) {
      setSelectedAnnId(null);
    }

    if (toolMode === 'text') {
      const annId = `ann-${Date.now()}`;
      onAddAnnotation({
        id: annId,
        type: 'text',
        pageIndex: currentPage,
        x,
        y,
        text: inputText,
        color: drawColor,
        fontSize,
        fontFamily,
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        align: textAlign,
      });
      setSelectedAnnId(annId);
    } else if (toolMode === 'whiteout') {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: 'rect',
        pageIndex: currentPage,
        x,
        y,
        width: 140,
        height: 36,
        color: '#ffffff',
        strokeWidth: 0,
      });
    } else if (toolMode === 'highlight') {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: 'highlight',
        pageIndex: currentPage,
        x,
        y,
        width: 160,
        height: 30,
      });
    } else if (toolMode === 'rect') {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: 'rect',
        pageIndex: currentPage,
        x,
        y,
        width: 150,
        height: 80,
        color: drawColor,
        strokeWidth,
      });
    } else if (toolMode === 'circle') {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: 'circle',
        pageIndex: currentPage,
        x,
        y,
        width: 100,
        height: 100,
        color: drawColor,
        strokeWidth,
      });
    } else if (toolMode === 'stamp') {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: 'stamp',
        pageIndex: currentPage,
        x,
        y,
        stampText: selectedStamp,
        color: drawColor,
      });
    } else if (toolMode === 'draw') {
      isDrawing.current = true;
      currentPoints.current = [{ x, y }];
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomScale;
    const y = (e.clientY - rect.top) / zoomScale;

    if (draggingAnnId && dragStartPos) {
      const dx = (e.clientX - dragStartPos.x) / zoomScale;
      const dy = (e.clientY - dragStartPos.y) / zoomScale;

      const ann = annotations.find((a) => a.id === draggingAnnId);
      if (ann) {
        if (ann.isOriginalTextEdit) {
          const xPctChange = (dx / (pageRef.current?.offsetWidth || 1)) * 100;
          const yPctChange = (dy / (pageRef.current?.offsetHeight || 1)) * 100;
          onUpdateAnnotation(draggingAnnId, { x: ann.x + xPctChange, y: ann.y + yPctChange, isUnmodifiedOriginal: false });
        } else {
          onUpdateAnnotation(draggingAnnId, { x: ann.x + dx, y: ann.y + dy, isUnmodifiedOriginal: false });
        }
      }
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing.current || toolMode !== 'draw') return;
    currentPoints.current.push({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setDraggingAnnId(null);
    setDragStartPos(null);
    if (isDrawing.current && currentPoints.current.length > 1) {
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: 'draw',
        pageIndex: currentPage,
        x: currentPoints.current[0].x,
        y: currentPoints.current[0].y,
        points: [...currentPoints.current],
        color: drawColor,
        strokeWidth,
      });
    }
    isDrawing.current = false;
    currentPoints.current = [];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAddAnnotation({
            id: `ann-${Date.now()}`,
            type: 'image',
            pageIndex: currentPage,
            x: 100,
            y: 100,
            width: 180,
            imageDataUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOriginalTextClick = (item: ExtractedTextItem) => {
    setHiddenTextIds((prev) => new Set(prev).add(item.id));
    const annId = `edit-${item.id}`;
    setEditFontSizePxMap((prev) => ({ ...prev, [annId]: Math.round(item.fontSizePx) }));
    
    let cleanFontName = item.fontName || '';
    if (cleanFontName.includes('+')) cleanFontName = cleanFontName.split('+')[1];
    const fontNameLower = cleanFontName.toLowerCase();
    
    const isTextBold = fontNameLower.includes('bold') || fontNameLower.includes('black') || fontNameLower.includes('heavy');
    const isTextItalic = fontNameLower.includes('italic') || fontNameLower.includes('oblique');
    
    let safeFontFamily = 'Arial, Helvetica, sans-serif'; 
    if (fontNameLower.includes('times') || fontNameLower.includes('serif')) {
      safeFontFamily = '"Times New Roman", Times, serif';
    } else if (fontNameLower.includes('courier') || fontNameLower.includes('mono')) {
      safeFontFamily = '"Courier New", Courier, monospace';
    } else if (cleanFontName) {
      const exactName = cleanFontName.split(',')[0].replace(/-/g, ' ').replace(/["]/g, '');
      safeFontFamily = `"${exactName}", Arial, sans-serif`;
    }

    const newAnn: PDFAnnotation = {
      id: annId,
      type: 'text',
      pageIndex: currentPage,
      x: item.xPct,
      y: item.yPct,
      width: item.widthPct,
      height: item.heightPct,
      text: item.str,
      color: item.color || '#222222',
      fontSize: item.fontSizePct,
      fontFamily: safeFontFamily,
      bold: isTextBold,
      italic: isTextItalic,
      underline: false,
      align: 'left',
      isOriginalTextEdit: true,
      isUnmodifiedOriginal: true,
    };

    onAddAnnotation(newAnn);
    setSelectedAnnId(annId);
    
    setFontSize(-1);
    setFontFamily('original');
    setDrawColor(item.color || '#222222');
    setIsBold(isTextBold);
    setIsItalic(isTextItalic);
    setIsUnderline(false);
    setTextAlign('left');
  };

  const pageAnns = annotations.filter((a) => a.pageIndex === currentPage);

  return (
    <div className="w-full my-6 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[850px]">
      
      {/* Top Floating Header Controls */}
      <div className="w-full bg-slate-850 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-xl border transition-all ${
              showThumbnails ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Page Thumbnails"
          >
            <Layers className="w-4 h-4" />
          </button>

          <span className="text-xs font-extrabold uppercase tracking-wider text-red-500 bg-red-950/60 border border-red-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Edit3 className="w-3.5 h-3.5" /> iLovePDF Interactive Editor
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {toolMode === 'stamp' && (
            <select
              value={selectedStamp}
              onChange={(e) => setSelectedStamp(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
            >
              <option value="APPROVED">APPROVED</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="DRAFT">DRAFT</option>
              <option value="URGENT">URGENT</option>
              <option value="FINAL">FINAL</option>
            </select>
          )}

          {(toolMode === 'draw' || toolMode === 'rect' || toolMode === 'circle') && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Stroke:</span>
              <input
                type="range"
                min="2"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-16 accent-red-500"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:text-red-400"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <select
            value={zoomScale}
            onChange={(e) => setZoomScale(parseFloat(e.target.value))}
            className="px-2 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-bold"
          >
            <option value={0.75}>75%</option>
            <option value={1.0}>100% (Normal)</option>
            <option value={1.25}>125% (Large)</option>
            <option value={1.5}>150% (HD Zoom)</option>
            <option value={1.8}>180% (Ultra Zoom)</option>
          </select>

          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:text-red-400"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomScale(1.0)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:text-red-400"
            title="Fit to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>
            {currentPage + 1}/{pages.length}
          </span>
          <button
            disabled={currentPage === pages.length - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-[750px]">
        
        <div className="w-16 bg-slate-850 border-r border-slate-800 p-2 flex flex-col items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setToolMode('editText')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'editText' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Edit Existing PDF Text (Click text on page)"
          >
            <Edit3 className="w-4 h-4" />
            Edit Text
          </button>

          <button
            type="button"
            onClick={() => setToolMode('move')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'move' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Select & Move Objects"
          >
            <Move className="w-4 h-4" />
            Move
          </button>

          <button
            type="button"
            onClick={() => setToolMode('text')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'text' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Add New Text Box"
          >
            <Type className="w-4 h-4" />
            Add Text
          </button>

          <button
            type="button"
            onClick={() => setToolMode('highlight')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'highlight' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Highlight Text Marker"
          >
            <Highlighter className="w-4 h-4" />
            Highlight
          </button>

          <button
            type="button"
            onClick={() => setToolMode('draw')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'draw' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Freehand Pen"
          >
            <PenTool className="w-4 h-4" />
            Pen
          </button>

          <button
            type="button"
            onClick={() => setToolMode('rect')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'rect' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Draw Box"
          >
            <Square className="w-4 h-4" />
            Box
          </button>

          <button
            type="button"
            onClick={() => setToolMode('circle')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'circle' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Draw Circle"
          >
            <CircleIcon className="w-4 h-4" />
            Circle
          </button>

          <button
            type="button"
            onClick={() => setToolMode('stamp')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'stamp' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Insert Stamp"
          >
            <Stamp className="w-4 h-4" />
            Stamp
          </button>

          <button
            type="button"
            onClick={() => setToolMode('whiteout')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 transition-all ${
              toolMode === 'whiteout' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Whiteout Eraser / Redact"
          >
            <Eraser className="w-4 h-4" />
            Whiteout
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[9px] font-bold gap-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            title="Add / Replace Image"
          >
            <Upload className="w-4 h-4" />
            Image
          </button>

          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/png,image/jpeg"
            className="hidden"
          />
        </div>

        {showThumbnails && (
          <div className="w-44 bg-slate-850 border-r border-slate-800 p-3 overflow-y-auto flex flex-col gap-3 shrink-0">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pages ({pages.length})</h5>
            {pages.map((p, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`p-1.5 rounded-xl border cursor-pointer transition-all ${
                  currentPage === idx ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <img src={p.dataUrl} alt={`Page ${idx + 1}`} className="w-full object-contain rounded shadow-xs" />
                <span className="text-[10px] text-slate-400 font-bold block text-center mt-1">Page {idx + 1}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 bg-slate-950 overflow-auto p-6 flex justify-center items-start">
          
          <div
            ref={pageRef}
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="relative bg-white border border-slate-700 shadow-2xl rounded-sm overflow-hidden select-none cursor-crosshair transition-transform duration-150 my-4"
          >
            <img
              src={pages[currentPage]?.dataUrl}
              alt={`Page ${currentPage + 1}`}
              className="block w-full h-auto object-contain pointer-events-none"
            />

            {originalTextItems.map((item) => {
              const isHidden = hiddenTextIds.has(item.id);
              if (!isHidden) return null;

              const annId = `edit-${item.id}`;
              const correspondingAnn = annotations.find(a => a.id === annId);
              if (correspondingAnn && correspondingAnn.isUnmodifiedOriginal) return null;

              return (
                <div
                  key={`whiteout-${item.id}`}
                  style={{
                    position: 'absolute',
                    left: `${item.xPct}%`,
                    top: `${item.yPct}%`,
                    width: `${item.widthPct}%`,
                    height: `${item.heightPct}%`,
                    backgroundColor: '#ffffff',
                    zIndex: 15,
                  }}
                  className="pointer-events-none"
                />
              );
            })}

            {toolMode === 'editText' && originalTextItems.map((item) => {
              const isHidden = hiddenTextIds.has(item.id);
              if (isHidden) return null;
              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOriginalTextClick(item);
                  }}
                  style={{
                    left: `${item.xPct}%`,
                    top: `${item.yPct}%`,
                    width: `${item.widthPct}%`,
                    height: `${item.heightPct}%`,
                  }}
                  className="absolute z-10 hover:ring-2 hover:ring-blue-500 hover:bg-blue-500/10 rounded-sm cursor-pointer transition-all flex items-center group border border-transparent hover:border-blue-400/50"
                  title="Click to select & edit text"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded absolute -top-5 left-0 z-30 shadow-md whitespace-nowrap pointer-events-none">
                    Select Text
                  </span>
                </div>
              );
            })}

            {pageAnns.map((ann) => {
              const isSelected = selectedAnnId === ann.id;
              return (
                <div
                  key={ann.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnId(ann.id);
                  }}
                  onMouseDown={(e) => {
                    if (toolMode === 'move') {
                      e.stopPropagation();
                      setDraggingAnnId(ann.id);
                      setDragStartPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  style={ann.isOriginalTextEdit ? {
                    left: `${ann.x}%`,
                    top: `${ann.y}%`,
                    width: `${ann.width}%`,
                    height: `${ann.height}%`,
                    containerType: 'size',
                  } : {
                    left: `${ann.x}px`,
                    top: `${ann.y}px`,
                  }}
                  className={`absolute group z-20 pointer-events-auto rounded-xs p-0 m-0 leading-none ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white' : ''
                  } ${toolMode === 'move' ? 'cursor-move hover:ring-2 hover:ring-red-500' : ''}`}
                >
                  {isSelected && (
                    <>
                      <div className="w-2.5 h-2.5 bg-blue-600 border border-white rounded-full absolute -top-1.5 -left-1.5 z-40 shadow-sm" />
                      <div className="w-2.5 h-2.5 bg-blue-600 border border-white rounded-full absolute -top-1.5 -right-1.5 z-40 shadow-sm" />
                      <div className="w-2.5 h-2.5 bg-blue-600 border border-white rounded-full absolute -bottom-1.5 -left-1.5 z-40 shadow-sm" />
                      <div className="w-2.5 h-2.5 bg-blue-600 border border-white rounded-full absolute -bottom-1.5 -right-1.5 z-40 shadow-sm" />
                    </>
                  )}

                  {ann.type === 'text' && (
                    <div 
                      className="relative flex items-center p-0 m-0" 
                      style={{ width: '100%', height: '100%', justifyContent: ann.align === 'center' ? 'center' : (ann.align === 'right' ? 'flex-end' : 'flex-start') }}
                    >
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => setSelectedAnnId(ann.id)}
                        onBlur={(e) => {
                          const newText = e.currentTarget.innerText;
                          if (newText !== ann.text) updateSelectedAnnProps({ text: newText });
                        }}
                        onInput={() => {
                          if (ann.isUnmodifiedOriginal) updateSelectedAnnProps({});
                        }}
                        style={{
                          display: 'block',
                          color: ann.isUnmodifiedOriginal ? 'transparent' : (ann.color || '#111827'),
                          caretColor: '#111827',
                          fontSize: ann.isOriginalTextEdit ? '87cqh' : `${ann.fontSize || 16}px`,
                          fontWeight: ann.bold ? 'bold' : 'normal',
                          fontStyle: ann.italic ? 'italic' : 'normal',
                          textDecoration: ann.underline ? 'underline' : 'none',
                          fontFamily: ann.fontFamily || 'Helvetica, Arial, sans-serif',
                          lineHeight: ann.isOriginalTextEdit ? 1.15 : 1,
                          padding: 0,
                          margin: 0,
                          whiteSpace: 'nowrap',
                          outline: 'none',
                          textAlign: ann.align || 'left',
                          ...(ann.isOriginalTextEdit ? { width: '100%' } : {}),
                        }}
                        className="focus:bg-blue-50/20 rounded-xs"
                      >
                        {ann.text}
                      </span>
                    </div>
                  )}

                  {ann.type === 'highlight' && (
                    <div style={{ width: `${ann.width || 160}px`, height: `${ann.height || 30}px` }} className="bg-amber-300/50 backdrop-blur-xs rounded border border-amber-400/40" />
                  )}

                  {ann.type === 'rect' && (
                    <div style={{ width: `${ann.width}px`, height: `${ann.height}px`, backgroundColor: ann.color === '#ffffff' ? '#ffffff' : 'transparent', borderColor: ann.color === '#ffffff' ? '#ffffff' : ann.color, borderWidth: `${ann.strokeWidth || 2}px` }} className="rounded" />
                  )}

                  {ann.type === 'circle' && (
                    <div style={{ width: `${ann.width}px`, height: `${ann.height}px`, borderColor: ann.color, borderWidth: `${ann.strokeWidth || 2}px` }} className="rounded-full border" />
                  )}

                  {ann.type === 'stamp' && (
                    <div style={{ borderColor: ann.color, color: ann.color }} className="border-4 border-double px-5 py-2 text-base font-black uppercase tracking-widest bg-white/95 shadow-lg transform -rotate-6 rounded-md">
                      {ann.stampText}
                    </div>
                  )}

                  {ann.type === 'image' && ann.imageDataUrl && (
                    <img src={ann.imageDataUrl} alt="Inserted object" style={{ width: `${ann.width || 180}px` }} className="rounded shadow-md object-contain" />
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ann.id.startsWith('edit-')) {
                        const origId = ann.id.replace('edit-', '');
                        setHiddenTextIds((prev) => { const next = new Set(prev); next.delete(origId); return next; });
                      }
                      if (selectedAnnId === ann.id) setSelectedAnnId(null);
                      onRemoveAnnotation(ann.id);
                    }}
                    className="absolute -top-3 -right-3 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white shadow-lg text-xs z-40"
                    title="Delete object"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {showRightSidebar && (
          <div className="w-72 bg-slate-850 border-l border-slate-800 p-5 flex flex-col gap-6 text-white shrink-0 overflow-y-auto shadow-xl">
            <div className="border-b border-slate-700/60 pb-3 flex items-center justify-between">
              <h4 className="text-sm font-extrabold tracking-wide uppercase text-slate-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-red-500" /> Text Styles
              </h4>
              {selectedAnn && (
                <span className="text-[10px] bg-red-500/20 border border-red-500/40 text-red-400 px-2 py-0.5 rounded-md font-bold">
                  Active Box
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Font Family</label>
              <select
                value={selectedAnn ? (selectedAnn.fontFamily || fontFamily) : fontFamily}
                onChange={(e) => {
                  const val = e.target.value;
                  setFontFamily(val);
                  if (selectedAnn && val !== 'original') updateSelectedAnnProps({ fontFamily: val });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                <option value="original">- Original PDF Font -</option>
                <option value="Helvetica">Helvetica (Standard Sans)</option>
                <option value="Times">Times New Roman (Serif)</option>
                <option value="Courier">Courier New (Monospace)</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Impact">Impact</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Font Size (pt/px)</label>
              <select
                value={selectedAnn ? (selectedAnn.isOriginalTextEdit && !editFontSizePxMap[selectedAnn.id] ? -1 : (selectedAnn.fontSize || fontSize)) : fontSize}
                onChange={(e) => {
                  const newPxSize = parseInt(e.target.value, 10);
                  setFontSize(newPxSize);
                  if (selectedAnn && newPxSize !== -1) {
                    const pageH = pages[currentPage] ? 841.89 : 800;
                    const fontSizePct = (newPxSize / pageH) * 100;
                    if (selectedAnn.isOriginalTextEdit) {
                       updateSelectedAnnProps({ fontSize: fontSizePct, isOriginalTextEdit: false }, newPxSize);
                    } else {
                       updateSelectedAnnProps({ fontSize: newPxSize }, newPxSize);
                    }
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
              >
                <option value={-1}>- Original Size -</option>
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 60, 72].map((sz) => (
                  <option key={sz} value={sz}>{sz} pt</option>
                ))}
              </select>
            </div>

            {/* Bold, Italic, Underline Controls (iLovePDF Style) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Style & Weight</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = selectedAnn ? !selectedAnn.bold : !isBold;
                    setIsBold(nextVal);
                    if (selectedAnn) updateSelectedAnnProps({ bold: nextVal });
                  }}
                  className={`flex-1 py-2 rounded-xl border text-sm font-black transition-all flex items-center justify-center ${
                    (selectedAnn ? selectedAnn.bold : isBold)
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = selectedAnn ? !selectedAnn.italic : !isItalic;
                    setIsItalic(nextVal);
                    if (selectedAnn) updateSelectedAnnProps({ italic: nextVal });
                  }}
                  className={`flex-1 py-2 rounded-xl border text-sm font-black italic transition-all flex items-center justify-center ${
                    (selectedAnn ? selectedAnn.italic : isItalic)
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = selectedAnn ? !selectedAnn.underline : !isUnderline;
                    setIsUnderline(nextVal);
                    if (selectedAnn) updateSelectedAnnProps({ underline: nextVal });
                  }}
                  className={`flex-1 py-2 rounded-xl border text-sm font-black transition-all flex items-center justify-center ${
                    (selectedAnn ? selectedAnn.underline : isUnderline)
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Alignment Controls */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Text Alignment</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTextAlign('left');
                    if (selectedAnn) updateSelectedAnnProps({ align: 'left' });
                  }}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center ${
                    (selectedAnn ? selectedAnn.align === 'left' : textAlign === 'left')
                      ? 'bg-red-500 text-white border-red-500 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTextAlign('center');
                    if (selectedAnn) updateSelectedAnnProps({ align: 'center' });
                  }}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center ${
                    (selectedAnn ? selectedAnn.align === 'center' : textAlign === 'center')
                      ? 'bg-red-500 text-white border-red-500 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTextAlign('right');
                    if (selectedAnn) updateSelectedAnnProps({ align: 'right' });
                  }}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center ${
                    (selectedAnn ? selectedAnn.align === 'right' : textAlign === 'right')
                      ? 'bg-red-500 text-white border-red-500 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Color & Palette (iLovePDF Style) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">Current Color</label>
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer"
                  style={{ backgroundColor: selectedAnn?.color || drawColor }}
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {colorSwatches.map((hex) => {
                  const active = (selectedAnn?.color || drawColor).toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        setDrawColor(hex);
                        if (selectedAnn) updateSelectedAnnProps({ color: hex });
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center shadow-xs ${
                        active ? 'border-red-500 scale-110 ring-2 ring-red-400/50' : 'border-slate-700 hover:scale-105'
                      }`}
                    >
                      {active && <Check className={`w-4 h-4 ${hex === '#ffffff' ? 'text-black' : 'text-white'}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold">Custom:</span>
                <input
                  type="color"
                  value={selectedAnn?.color || drawColor}
                  onChange={(e) => {
                    const hex = e.target.value;
                    setDrawColor(hex);
                    if (selectedAnn) updateSelectedAnnProps({ color: hex });
                  }}
                  className="w-full h-8 rounded-xl border border-slate-700 cursor-pointer p-1 bg-slate-800"
                />
              </div>
            </div>

            {/* Action Buttons for Selected Item */}
            {selectedAnn && (
              <div className="pt-4 border-t border-slate-700/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAnn.id.startsWith('edit-')) {
                      const origId = selectedAnn.id.replace('edit-', '');
                      setHiddenTextIds((prev) => {
                        const next = new Set(prev);
                        next.delete(origId);
                        return next;
                      });
                    }
                    onRemoveAnnotation(selectedAnn.id);
                    setSelectedAnnId(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 border border-red-500/50 hover:bg-red-600 hover:border-red-600 text-red-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete Selected Text
                </button>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
