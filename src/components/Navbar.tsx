"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { 
  FileText, 
  Search, 
  Sun, 
  Moon, 
  ChevronDown, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Menu,
  X,
  Wifi,
  Globe,
  Image,
  Type,
  Activity,
  Calculator
} from 'lucide-react';
import { CATEGORIES, TOOLS } from '../config/tools';
import type { ToolId } from '../types';

interface NavbarProps {
  onSelectTool?: (id: ToolId | null) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectTool = (id) => {
    if (typeof window !== 'undefined') {
      window.location.href = id ? `/?tool=${id}` : '/';
    }
  },
  darkMode = true,
  onToggleDarkMode = () => {},
  searchQuery = '',
  onSearchChange = () => {},
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const networkTools = TOOLS.filter(t => t.category === 'network-security');

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Logo
            onClick={() => {
              onSelectTool(null);
              onSearchChange('');
            }}
          />

          {/* Center Search & Dropdown Navigation */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* PDF Tools Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'pdf' ? null : 'pdf')}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Layers className="w-4 h-4 text-red-500" />
                PDF
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'pdf' ? 'rotate-180' : ''}`} />
              </button>

              {/* PDF Mega Dropdown Panel */}
              {activeDropdown === 'pdf' && (
                <div 
                  className="absolute left-0 mt-2 w-[720px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {CATEGORIES.filter(c => ['organize', 'convert-from', 'convert-to', 'edit-security', 'advanced'].includes(c.id)).map(cat => (
                    <div key={cat.id} className="flex flex-col gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        {cat.name}
                      </h4>
                      <div className="flex flex-col gap-1">
                        {TOOLS.filter(t => t.category === cat.id).map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              onSelectTool(tool.id);
                              onSearchChange('');
                              setActiveDropdown(null);
                            }}
                            className="text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded-md transition-colors flex items-center justify-between group"
                          >
                            <span>{tool.name}</span>
                            {tool.popular && (
                              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1 rounded">HOT</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Categories Dropdowns */}
            {[
              { id: 'network-security', name: 'Network', icon: Globe, textColor: 'text-cyan-500', hoverText: 'hover:text-cyan-500', hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/40' },
              { id: 'media-tools', name: 'Media', icon: Image, textColor: 'text-fuchsia-500', hoverText: 'hover:text-fuchsia-500', hoverBg: 'hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/40' },
              { id: 'text-tools', name: 'Text', icon: Type, textColor: 'text-blue-500', hoverText: 'hover:text-blue-500', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/40' },
              { id: 'seo-tools', name: 'SEO', icon: Activity, textColor: 'text-emerald-500', hoverText: 'hover:text-emerald-500', hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40' },
              { id: 'calculators', name: 'Calc', icon: Calculator, textColor: 'text-indigo-500', hoverText: 'hover:text-indigo-500', hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40' },
            ].map(cat => (
              <div key={cat.id} className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === cat.id ? null : cat.id)}
                  className={`flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 ${cat.hoverText} transition-colors px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800`}
                >
                  <cat.icon className={`w-4 h-4 ${cat.textColor}`} />
                  {cat.name}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === cat.id ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === cat.id && (
                  <div 
                    className={`absolute ${['seo-tools', 'calculators'].includes(cat.id) ? 'right-0' : 'left-0'} mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50`}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${cat.textColor} border-b border-slate-100 dark:border-slate-800 pb-2 mb-3`}>
                      {CATEGORIES.find(c => c.id === cat.id)?.name}
                    </h4>
                    <div className="flex flex-col gap-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                      {TOOLS.filter(t => t.category === cat.id).map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            onSelectTool(tool.id);
                            onSearchChange('');
                            setActiveDropdown(null);
                          }}
                          className={`text-left text-xs font-medium text-slate-700 dark:text-slate-300 ${cat.hoverText} ${cat.hoverBg} p-2 rounded-lg transition-colors flex items-center justify-between`}
                        >
                          <span>{tool.name}</span>
                          {tool.popular && (
                            <span className={`text-[9px] font-bold ${cat.textColor} px-1 rounded`}>HOT</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Blog Link */}
            <Link
              href="/blog"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-red-500 transition-colors px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 text-red-500" />
              Blog
            </Link>

          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Global Search input */}
            <div className="relative hidden md:block w-48 xl:w-56 transition-all">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-indigo-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 pr-8 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile: PDF Tools */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">PDF Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.filter(t => t.category !== 'network-security').slice(0, 10).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTool(t.id);
                    onSearchChange('');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: Network Tools */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-500 mb-2 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5" /> Network &amp; Security
            </p>
            <div className="grid grid-cols-2 gap-2">
              {networkTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTool(t.id);
                    onSearchChange('');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-semibold text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-500"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

