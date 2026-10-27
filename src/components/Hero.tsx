import React from 'react';
import { CATEGORIES } from '../config/tools';
import type { CategoryId } from '../types';
import { Sparkles, Shield, Zap, Lock } from 'lucide-react';

interface HeroProps {
  activeCategory: CategoryId | 'all';
  onSelectCategory: (category: CategoryId | 'all') => void;
  onClearSearch: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  activeCategory,
  onSelectCategory,
  onClearSearch,
}) => {
  return (
    <div className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
      
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold mb-5 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-red-500" />
        <span>100% Free Online Tools Suite</span>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
        Every tool you need to get work done, <span className="text-red-600 dark:text-red-500">all in one place</span>
      </h1>

      <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
        PDF editors, Image converters, Media tools, Network security utilities, SEO analyzers, and Smart Calculators. Fully functional with 100% client-side privacy.
      </p>

      {/* Trust Highlights */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl shadow-sm text-sm font-bold">
          <Shield className="w-5 h-5 shrink-0" />
          <span>Your files never get uploaded to external servers. 100% processed on your device.</span>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Lightning Fast
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-500" /> No Limits or Signup
          </span>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="mt-10 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id as any);
                onClearSearch();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
