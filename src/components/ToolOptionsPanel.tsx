import React from 'react';
import type { ToolId, WatermarkOptions, PageNumberOptions } from '../types';
import { 
  Image as ImageIcon, 
  Lock, 
  Key, 
  Hash, 
  Stamp, 
  Zap,
  Sliders,
  Edit2
} from 'lucide-react';

interface ToolOptionsPanelProps {
  toolId: ToolId;
  splitRange: string;
  onSplitRangeChange: (r: string) => void;
  watermarkOpts: WatermarkOptions;
  onWatermarkOptsChange: (opts: WatermarkOptions) => void;
  pageNumberOpts: PageNumberOptions;
  onPageNumberOptsChange: (opts: PageNumberOptions) => void;
  passwordInput: string;
  onPasswordInputChange: (p: string) => void;
  compressLevel: 'low' | 'medium' | 'high';
  onCompressLevelChange: (l: 'low' | 'medium' | 'high') => void;
  imageFitOpts: { orientation: 'portrait' | 'landscape'; margin: number; fit: boolean };
  onImageFitOptsChange: (opts: { orientation: 'portrait' | 'landscape'; margin: number; fit: boolean }) => void;
  signatureDataUrl: string;
  onOpenSignatureModal: () => void;
}

export const ToolOptionsPanel: React.FC<ToolOptionsPanelProps> = ({
  toolId,
  splitRange,
  onSplitRangeChange,
  watermarkOpts,
  onWatermarkOptsChange,
  pageNumberOpts,
  onPageNumberOptsChange,
  passwordInput,
  onPasswordInputChange,
  compressLevel,
  onCompressLevelChange,
  imageFitOpts,
  onImageFitOptsChange,
  signatureDataUrl,
  onOpenSignatureModal,
}) => {

  if (toolId === 'split-pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-red-500" />
          Split Options
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Page Range (e.g. "1-3, 5, 8-10" or leave empty for all individual pages)
            </label>
            <input
              type="text"
              placeholder="e.g. 1-3, 5, 8-10"
              value={splitRange}
              onChange={(e) => onSplitRangeChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'watermark-pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Stamp className="w-4 h-4 text-red-500" />
          Watermark Settings
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Watermark Text
            </label>
            <input
              type="text"
              placeholder="CONFIDENTIAL / DRAFT"
              value={watermarkOpts.text || ''}
              onChange={(e) => onWatermarkOptsChange({ ...watermarkOpts, text: e.target.value })}
              className="w-full px-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Font Size ({watermarkOpts.fontSize}px)
              </label>
              <input
                type="range"
                min="12"
                max="100"
                value={watermarkOpts.fontSize}
                onChange={(e) => onWatermarkOptsChange({ ...watermarkOpts, fontSize: parseInt(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={watermarkOpts.color}
                onChange={(e) => onWatermarkOptsChange({ ...watermarkOpts, color: e.target.value })}
                className="w-full h-9 p-1 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2 w-48">
              {[
                { id: 'top-left', label: 'TL' },
                { id: 'center', label: 'Center' },
                { id: 'top-right', label: 'TR' },
                { id: 'bottom-left', label: 'BL' },
                { id: 'bottom-right', label: 'BR' },
              ].map((pos, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onWatermarkOptsChange({ ...watermarkOpts, position: pos.id as any })}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    watermarkOpts.position === pos.id
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transparency ({Math.round(watermarkOpts.opacity * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={watermarkOpts.opacity}
                onChange={(e) => onWatermarkOptsChange({ ...watermarkOpts, opacity: parseFloat(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rotation Angle ({watermarkOpts.rotation}°)
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={watermarkOpts.rotation}
                onChange={(e) => onWatermarkOptsChange({ ...watermarkOpts, rotation: parseInt(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'page-numbers') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4 text-red-500" />
          Page Number Formatting
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Format Style
            </label>
            <select
              value={pageNumberOpts.format}
              onChange={(e) => onPageNumberOptsChange({ ...pageNumberOpts, format: e.target.value as any })}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
            >
              <option value="number-only">Numbers Only (1, 2, 3)</option>
              <option value="page-n">Page N (Page 1, Page 2)</option>
              <option value="page-n-of-x">Page N of X (Page 1 of 10)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Position
            </label>
            <select
              value={pageNumberOpts.position}
              onChange={(e) => onPageNumberOptsChange({ ...pageNumberOpts, position: e.target.value as any })}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
            >
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Start Counting From
            </label>
            <input
              type="number"
              min="1"
              value={pageNumberOpts.startFrom}
              onChange={(e) => onPageNumberOptsChange({ ...pageNumberOpts, startFrom: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'protect-pdf' || toolId === 'unlock-pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6 max-w-lg mx-auto">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          {toolId === 'protect-pdf' ? <Lock className="w-4 h-4 text-red-500" /> : <Key className="w-4 h-4 text-emerald-500" />}
          {toolId === 'protect-pdf' ? 'Set Encryption Password' : 'Enter PDF Password'}
        </h4>

        <div>
          <input
            type="password"
            placeholder={toolId === 'protect-pdf' ? 'Type strong password...' : 'Enter password to unlock...'}
            value={passwordInput}
            onChange={(e) => onPasswordInputChange(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'compress-pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-500" />
          Compression Preset
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'low', name: 'Less Compression', desc: 'High quality, less compression' },
            { id: 'medium', name: 'Recommended Compression', desc: 'Good quality, good compression' },
            { id: 'high', name: 'Extreme Compression', desc: 'Less quality, high compression' },
          ].map((preset) => (
            <div
              key={preset.id}
              onClick={() => onCompressLevelChange(preset.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                compressLevel === preset.id
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 dark:text-red-400 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <h5 className="text-sm font-bold">{preset.name}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">{preset.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolId === 'jpg-to-pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-red-500" />
          PDF Page Setup
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Page Orientation
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onImageFitOptsChange({ ...imageFitOpts, orientation: 'portrait' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                  imageFitOpts.orientation === 'portrait'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => onImageFitOptsChange({ ...imageFitOpts, orientation: 'landscape' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                  imageFitOpts.orientation === 'landscape'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Page Margin ({imageFitOpts.margin}pt)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={imageFitOpts.margin}
              onChange={(e) => onImageFitOptsChange({ ...imageFitOpts, margin: parseInt(e.target.value) })}
              className="w-full accent-red-500"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={imageFitOpts.fit}
                onChange={(e) => onImageFitOptsChange({ ...imageFitOpts, fit: e.target.checked })}
                className="w-4 h-4 accent-red-500 rounded"
              />
              Fit images to page boundaries
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'sign-pdf') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm my-6 text-center">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
          <Edit2 className="w-4 h-4 text-red-500" />
          Electronic Signature
        </h4>

        {signatureDataUrl ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white max-w-xs shadow-inner">
              <img src={signatureDataUrl} alt="Your signature" className="max-h-24 object-contain" />
            </div>
            <button
              type="button"
              onClick={onOpenSignatureModal}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Re-draw or Change Signature
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSignatureModal}
            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20"
          >
            Create Signature
          </button>
        )}
      </div>
    );
  }

  return null;
};
