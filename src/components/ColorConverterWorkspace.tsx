import { useState, useEffect } from 'react';
import { Palette, Copy, Check, SlidersHorizontal } from 'lucide-react';

export function ColorConverterWorkspace() {
  const [hex, setHex] = useState('#6366f1');
  const [r, setR] = useState('99');
  const [g, setG] = useState('102');
  const [b, setB] = useState('241');
  const [copied, setCopied] = useState('');

  // Handle Hex Input
  const handleHexChange = (val: string) => {
    let cleanHex = val.replace('#', '');
    setHex(val);
    
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    
    if (cleanHex.length === 6 && /^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      setR(parseInt(cleanHex.slice(0, 2), 16).toString());
      setG(parseInt(cleanHex.slice(2, 4), 16).toString());
      setB(parseInt(cleanHex.slice(4, 6), 16).toString());
    }
  };

  // Handle RGB Input
  const handleRgbChange = (color: 'r' | 'g' | 'b', val: string) => {
    if (val !== '' && (parseInt(val) < 0 || parseInt(val) > 255)) return;
    
    let newR = r, newG = g, newB = b;
    if (color === 'r') { setR(val); newR = val; }
    if (color === 'g') { setG(val); newG = val; }
    if (color === 'b') { setB(val); newB = val; }

    const numR = parseInt(newR || '0');
    const numG = parseInt(newG || '0');
    const numB = parseInt(newB || '0');

    if (!isNaN(numR) && !isNaN(numG) && !isNaN(numB)) {
      const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      setHex(`#${toHex(numR)}${toHex(numG)}${toHex(numB)}`);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const currentRgbString = `rgb(${r || '0'}, ${g || '0'}, ${b || '0'})`;
  const validHex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex) ? (hex.startsWith('#') ? hex : '#' + hex) : '#ffffff';

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-slate-50 dark:bg-slate-950 p-6">
      
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Color Converter</h2>
            <p className="text-sm font-medium text-slate-500">Convert between HEX and RGB formats effortlessly.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Color Preview & Picker */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center gap-4">
            <div 
              className="w-full aspect-square rounded-full shadow-inner border-4 border-slate-100 dark:border-slate-800 relative cursor-pointer group"
              style={{ backgroundColor: validHex }}
            >
              <input 
                type="color" 
                value={validHex.substring(0, 7)} 
                onChange={(e) => handleHexChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full pointer-events-none">
                <SlidersHorizontal className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Click circle to pick</p>
          </div>

          {/* Inputs */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* HEX Input */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">HEX Color</label>
                <button 
                  onClick={() => handleCopy(validHex, 'hex')}
                  className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copied === 'hex' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'hex' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={hex} 
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full text-2xl font-mono font-bold text-slate-800 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none py-2 uppercase"
                />
              </div>
            </div>

            {/* RGB Input */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">RGB Color</label>
                <button 
                  onClick={() => handleCopy(currentRgbString, 'rgb')}
                  className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copied === 'rgb' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'rgb' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-red-500 mb-1 text-center">R</label>
                  <input 
                    type="number" 
                    min="0" max="255"
                    value={r} 
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    className="w-full text-lg font-mono font-bold text-center text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-green-500 mb-1 text-center">G</label>
                  <input 
                    type="number" 
                    min="0" max="255"
                    value={g} 
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    className="w-full text-lg font-mono font-bold text-center text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-blue-500 mb-1 text-center">B</label>
                  <input 
                    type="number" 
                    min="0" max="255"
                    value={b} 
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    className="w-full text-lg font-mono font-bold text-center text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none py-2"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
