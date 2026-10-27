import React from 'react';
import * as Icons from 'lucide-react';
import type { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (id: ToolDefinition['id']) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const IconComponent = (Icons as any)[tool.iconName] || Icons.FileText;

  const getTheme = () => {
    switch (tool.id) {
      case 'merge-pdf':
      case 'split-pdf':
      case 'remove-pages':
      case 'extract-pages':
      case 'organize-pdf':
        return {
          iconBg: 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 group-hover:bg-red-600',
          hoverBorder: 'hover:border-red-500/60 dark:hover:border-red-500/60',
          hoverShadow: 'hover:shadow-red-500/10',
          accentColor: 'text-red-600 dark:text-red-400',
        };
      case 'pdf-to-word':
      case 'word-to-pdf':
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600',
          hoverBorder: 'hover:border-blue-500/60 dark:hover:border-blue-500/60',
          hoverShadow: 'hover:shadow-blue-500/10',
          accentColor: 'text-blue-600 dark:text-blue-400',
        };
      case 'pdf-to-excel':
      case 'excel-to-pdf':
        return {
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600',
          hoverBorder: 'hover:border-emerald-500/60 dark:hover:border-emerald-500/60',
          hoverShadow: 'hover:shadow-emerald-500/10',
          accentColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'pdf-to-ppt':
      case 'ppt-to-pdf':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600',
          hoverBorder: 'hover:border-amber-500/60 dark:hover:border-amber-500/60',
          hoverShadow: 'hover:shadow-amber-500/10',
          accentColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'pdf-to-jpg':
      case 'jpg-to-pdf':
        return {
          iconBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600',
          hoverBorder: 'hover:border-violet-500/60 dark:hover:border-violet-500/60',
          hoverShadow: 'hover:shadow-violet-500/10',
          accentColor: 'text-violet-600 dark:text-violet-400',
        };
      case 'compress-pdf':
        return {
          iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600',
          hoverBorder: 'hover:border-teal-500/60 dark:hover:border-teal-500/60',
          hoverShadow: 'hover:shadow-teal-500/10',
          accentColor: 'text-teal-600 dark:text-teal-400',
        };
      case 'protect-pdf':
      case 'unlock-pdf':
      case 'watermark-pdf':
      case 'page-numbers':
      case 'rotate-pdf':
        return {
          iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 group-hover:bg-sky-600',
          hoverBorder: 'hover:border-sky-500/60 dark:hover:border-sky-500/60',
          hoverShadow: 'hover:shadow-sky-500/10',
          accentColor: 'text-sky-600 dark:text-sky-400',
        };
      default:
        return {
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600',
          hoverBorder: 'hover:border-indigo-500/60 dark:hover:border-indigo-500/60',
          hoverShadow: 'hover:shadow-indigo-500/10',
          accentColor: 'text-indigo-600 dark:text-indigo-400',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={() => onSelect(tool.id)}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${theme.hoverBorder} rounded-2xl p-6 shadow-sm hover:shadow-xl ${theme.hoverShadow} hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm`}>
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>

          {tool.badge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
              {tool.badge}
            </span>
          )}
          {!tool.badge && tool.popular && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              POPULAR
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-1.5">
          {tool.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>

      <div className={`mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold ${theme.accentColor}`}>
        <span>Use Tool</span>
        <Icons.ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
