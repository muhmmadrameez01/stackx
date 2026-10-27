import React from 'react';
import { ShieldCheck, Zap, Lock, Sparkles, UploadCloud, Sliders, Download } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      
      {/* Section 1: Features & Advantages */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Why Millions Trust <span className="text-red-600 dark:text-red-500">Stackx</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Fast, secure, and private online tools built directly for your browser. No registration or software downloads required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              100% Client Privacy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your files never get uploaded to external servers. All operations execute safely inside your local web browser.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Instant Processing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No waiting in server conversion queues. Process your files instantly in high-speed WebAssembly memory.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              No Limits or Signup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enjoy full access to all tools completely free. Unlimited usage without account signups or watermarks.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              All-In-One Toolkit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Edit PDFs, convert images, download media, analyze SEO, calculate data, and secure your network effortlessly.
            </p>
          </div>

        </div>
      </div>

      {/* Section 2: How It Works */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Work with your files and data effortlessly in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-red-500/20 mb-2">
              01
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <UploadCloud className="w-4 h-4 text-red-500" />
              <span>Select Your Document</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Select your tool and drag & drop your files directly into the web browser workspace.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg flex items-center justify-center shadow-md mb-2">
              02
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Customize & Process</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Adjust settings like page order, password encryption, watermark, compression, or format.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 mb-2">
              03
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download Instantly</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Click download to get your converted files or instant results immediately.
            </p>
          </div>

        </div>
      </div>

    </section>
  );
};
