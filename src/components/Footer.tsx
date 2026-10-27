"use client";

import React from 'react';
import { FileText, ShieldCheck, Heart } from 'lucide-react';
import { Logo } from './Logo';
import type { ToolId } from '../types';
import { CATEGORIES, TOOLS } from '../config/tools';

interface FooterProps {
  onSelectTool?: (id: ToolId) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTool = (id) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/?tool=${id}`;
    }
  },
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" showSubtitle={false} />

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The ultimate web-based productivity suite. Merge PDFs, edit images, download media, and analyze networks with 100% privacy directly in your browser.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>All operations execute securely inside local browser memory</span>
            </div>
          </div>

          {/* Categorized Tool Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Organize PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onSelectTool('merge-pdf')} className="hover:text-red-400 transition-colors text-left">Merge PDF</button></li>
              <li><button onClick={() => onSelectTool('split-pdf')} className="hover:text-red-400 transition-colors text-left">Split PDF</button></li>
              <li><button onClick={() => onSelectTool('remove-pages')} className="hover:text-red-400 transition-colors text-left">Remove Pages</button></li>
              <li><button onClick={() => onSelectTool('extract-pages')} className="hover:text-red-400 transition-colors text-left">Extract Pages</button></li>
              <li><button onClick={() => onSelectTool('organize-pdf')} className="hover:text-red-400 transition-colors text-left">Organize PDF</button></li>
              <li><button onClick={() => onSelectTool('rotate-pdf')} className="hover:text-red-400 transition-colors text-left">Rotate PDF</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Convert PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onSelectTool('pdf-to-word')} className="hover:text-red-400 transition-colors text-left">PDF to Word</button></li>
              <li><button onClick={() => onSelectTool('pdf-to-excel')} className="hover:text-red-400 transition-colors text-left">PDF to Excel</button></li>
              <li><button onClick={() => onSelectTool('pdf-to-ppt')} className="hover:text-red-400 transition-colors text-left">PDF to PPT</button></li>
              <li><button onClick={() => onSelectTool('pdf-to-jpg')} className="hover:text-red-400 transition-colors text-left">PDF to JPG</button></li>
              <li><button onClick={() => onSelectTool('word-to-pdf')} className="hover:text-red-400 transition-colors text-left">Word to PDF</button></li>
              <li><button onClick={() => onSelectTool('jpg-to-pdf')} className="hover:text-red-400 transition-colors text-left">JPG to PDF</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Edit & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onSelectTool('compress-pdf')} className="hover:text-red-400 transition-colors text-left">Compress PDF</button></li>
              <li><button onClick={() => onSelectTool('protect-pdf')} className="hover:text-red-400 transition-colors text-left">Protect PDF</button></li>
              <li><button onClick={() => onSelectTool('unlock-pdf')} className="hover:text-red-400 transition-colors text-left">Unlock PDF</button></li>
              <li><button onClick={() => onSelectTool('watermark-pdf')} className="hover:text-red-400 transition-colors text-left">Watermark PDF</button></li>
              <li><button onClick={() => onSelectTool('sign-pdf')} className="hover:text-red-400 transition-colors text-left">Sign PDF</button></li>
              <li><button onClick={() => onSelectTool('ocr-pdf')} className="hover:text-red-400 transition-colors text-left">OCR PDF</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for complete digital productivity. © 2026 Stackx.
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="/blog" className="hover:text-red-400 transition-colors">Blog & Guides</a>
            <a href="/admin/blog" className="hover:text-red-400 transition-colors">CMS Admin</a>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Client-Side Security</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
