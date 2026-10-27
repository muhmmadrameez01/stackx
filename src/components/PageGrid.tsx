import React from 'react';
import type { PDFPageMeta } from '../types';
import { RotateCw, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface PageGridProps {
  pages: PDFPageMeta[];
  selectedIndexes: number[];
  onToggleSelect: (pageIndex: number) => void;
  onRotatePage: (pageIndex: number) => void;
  onRemovePage: (pageIndex: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  selectable?: boolean;
}

export const PageGrid: React.FC<PageGridProps> = ({
  pages,
  selectedIndexes,
  onToggleSelect,
  onRotatePage,
  onRemovePage,
  onMovePage,
  selectable = true,
}) => {
  return (
    <div className="w-full my-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {pages.map((page, idx) => {
          const isSelected = selectedIndexes.includes(page.pageIndex);
          return (
            <div
              key={`page-${page.pageIndex}-${idx}`}
              className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-lg ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-500/30 dark:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800'
              }`}
            >
              {/* Page Number Badge */}
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold">
                Page {idx + 1}
              </div>

              {/* Action Buttons Bar on Hover */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl text-white">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(idx);
                  }}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePage(idx);
                  }}
                  className="p-1 rounded-lg hover:bg-red-500/80 transition-colors text-rose-300 hover:text-white"
                  title="Delete page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Page Thumbnail Image */}
              <div
                onClick={() => selectable && onToggleSelect(page.pageIndex)}
                className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-850 p-2 flex items-center justify-center cursor-pointer overflow-hidden relative"
              >
                <img
                  src={page.dataUrl}
                  alt={`Page ${idx + 1}`}
                  style={{ transform: `rotate(${page.rotation}deg)` }}
                  className="max-h-full max-w-full object-contain shadow-md rounded transition-transform duration-300"
                />
              </div>

              {/* Reordering Handles Bar */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
                <button
                  disabled={idx === 0}
                  onClick={() => onMovePage(idx, idx - 1)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                <span className="text-[10px] font-semibold text-slate-400">
                  {page.rotation !== 0 ? `${page.rotation}°` : '0°'}
                </span>

                <button
                  disabled={idx === pages.length - 1}
                  onClick={() => onMovePage(idx, idx + 1)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
