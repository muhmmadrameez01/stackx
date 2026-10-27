import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Download, Image as ImageIcon, CheckCircle, Loader2, Lock, Unlock, Percent, Scaling } from 'lucide-react';
import JSZip from 'jszip';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
}

export function ImageResizerWorkspace() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [mode, setMode] = useState<'dimensions' | 'percentage'>('dimensions');
  
  // Settings
  const [targetWidth, setTargetWidth] = useState<number | ''>('');
  const [targetHeight, setTargetHeight] = useState<number | ''>('');
  const [percentage, setPercentage] = useState<number>(50);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [backgroundFill, setBackgroundFill] = useState<boolean>(false);
  const [fillType, setFillType] = useState<'color' | 'transparent'>('color');
  const [fillColor, setFillColor] = useState<string>('#000000');
  const [targetFileSizeKb, setTargetFileSizeKb] = useState<number | ''>('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Helper to load image dimensions
  const loadImageData = (file: File): Promise<{ width: number; height: number; url: string }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height, url });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageFile[] = [];
    
    for (const file of acceptedFiles) {
      try {
        const { width, height, url } = await loadImageData(file);
        newImages.push({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: url,
          originalWidth: width,
          originalHeight: height,
          targetWidth: width,
          targetHeight: height,
          status: 'idle'
        });
      } catch (err) {
        console.error("Error loading image", file.name, err);
      }
    }
    
    setImages(prev => {
      const updated = [...prev, ...newImages];
      // Auto-set width/height to first image if not set
      if (updated.length > 0 && targetWidth === '' && targetHeight === '') {
        setTargetWidth(updated[0].originalWidth);
        setTargetHeight(updated[0].originalHeight);
      }
      return updated;
    });
  }, [targetWidth, targetHeight]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    }
  });

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  // Recalculate target dimensions when settings change
  useEffect(() => {
    setImages(prev => prev.map(img => {
      let newW = img.originalWidth;
      let newH = img.originalHeight;

      if (mode === 'percentage') {
        newW = Math.round(img.originalWidth * (percentage / 100));
        newH = Math.round(img.originalHeight * (percentage / 100));
      } else {
        if (targetWidth !== '') newW = targetWidth as number;
        if (targetHeight !== '') newH = targetHeight as number;

        if (lockAspectRatio) {
          const ratio = img.originalWidth / img.originalHeight;
          if (targetWidth !== '' && targetHeight === '') {
            newH = Math.round((targetWidth as number) / ratio);
          } else if (targetHeight !== '' && targetWidth === '') {
            newW = Math.round((targetHeight as number) * ratio);
          } else if (targetWidth !== '' && targetHeight !== '') {
            // If both provided, fit within bounding box
            const inputRatio = (targetWidth as number) / (targetHeight as number);
            if (ratio > inputRatio) {
              newH = Math.round((targetWidth as number) / ratio);
              newW = targetWidth as number;
            } else {
              newW = Math.round((targetHeight as number) * ratio);
              newH = targetHeight as number;
            }
          }
        }
      }
      
      // Prevent 0 or negative
      newW = Math.max(1, newW);
      newH = Math.max(1, newH);

      return { ...img, targetWidth: newW, targetHeight: newH, status: 'idle', processedBlob: undefined };
    }));
  }, [mode, percentage, targetWidth, targetHeight, lockAspectRatio]);

  const handleWidthChange = (val: string) => {
    const num = parseInt(val);
    setTargetWidth(isNaN(num) ? '' : num);
    if (lockAspectRatio && !isNaN(num) && images.length > 0) {
      const ratio = images[0].originalWidth / images[0].originalHeight;
      setTargetHeight(Math.round(num / ratio));
    }
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val);
    setTargetHeight(isNaN(num) ? '' : num);
    if (lockAspectRatio && !isNaN(num) && images.length > 0) {
      const ratio = images[0].originalWidth / images[0].originalHeight;
      setTargetWidth(Math.round(num * ratio));
    }
  };

  // The core processing function using HTML5 Canvas
  const processImage = async (img: ImageFile): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.targetWidth;
      canvas.height = img.targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not available'));

      const imageElement = new Image();
      imageElement.onload = () => {
        
        let format = img.file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        if (!lockAspectRatio && backgroundFill) {
          // Fill background
          if (fillType === 'color') {
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, img.targetWidth, img.targetHeight);
            format = 'image/jpeg'; // Opaque background, better output as JPEG unless they want PNG, but user color is filled.
          } else {
            // Transparent
            ctx.clearRect(0, 0, img.targetWidth, img.targetHeight);
            format = 'image/png'; // Must be PNG for transparency
          }

          // Calculate fitted dimensions
          const ratio = img.originalWidth / img.originalHeight;
          const targetRatio = img.targetWidth / img.targetHeight;
          let drawWidth = img.targetWidth;
          let drawHeight = img.targetHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (ratio > targetRatio) {
            // Image is wider than target
            drawHeight = img.targetWidth / ratio;
            offsetY = (img.targetHeight - drawHeight) / 2;
          } else {
            // Image is taller than target
            drawWidth = img.targetHeight * ratio;
            offsetX = (img.targetWidth - drawWidth) / 2;
          }

          ctx.drawImage(imageElement, offsetX, offsetY, drawWidth, drawHeight);
        } else {
          // Default stretching behavior
          ctx.drawImage(imageElement, 0, 0, img.targetWidth, img.targetHeight);
        }

        let quality = 0.92; // Default high quality

        // Simple heuristic for target file size compression if JPEG/WEBP
        if (targetFileSizeKb !== '' && format !== 'image/png') {
          // Binary search for quality
          let minQ = 0.1;
          let maxQ = 1.0;
          let bestBlob: Blob | null = null;
          
          const attempt = (q: number) => {
            return new Promise<Blob>((res) => canvas.toBlob(b => res(b!), format, q));
          };

          const findQuality = async () => {
            for (let i = 0; i < 5; i++) {
              const currentQ = (minQ + maxQ) / 2;
              const blob = await attempt(currentQ);
              bestBlob = blob;
              const kb = blob.size / 1024;
              if (kb > (targetFileSizeKb as number)) {
                maxQ = currentQ; // Too big, lower quality
              } else {
                minQ = currentQ; // Good, try higher quality for better looks
              }
            }
            resolve(bestBlob || await attempt(0.8));
          };
          findQuality();
        } else {
          canvas.toBlob(b => {
            if (b) resolve(b);
            else reject(new Error('Canvas toBlob failed'));
          }, format, quality);
        }
      };
      imageElement.onerror = () => reject(new Error('Failed to load image for canvas'));
      imageElement.src = img.previewUrl;
    });
  };

  const handleExport = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      updatedImages[i].status = 'processing';
      setImages([...updatedImages]);
      
      try {
        const blob = await processImage(img);
        updatedImages[i].processedBlob = blob;
        updatedImages[i].status = 'done';
      } catch (err) {
        console.error(err);
        updatedImages[i].status = 'error';
      }
      
      setProgress(Math.round(((i + 1) / updatedImages.length) * 100));
      setImages([...updatedImages]);
    }

    setIsProcessing(false);

    // Download logic
    const successfulImages = updatedImages.filter(i => i.status === 'done' && i.processedBlob);
    
    if (successfulImages.length === 1) {
      // Single download
      const img = successfulImages[0];
      const url = URL.createObjectURL(img.processedBlob!);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized_${img.file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (successfulImages.length > 1) {
      // Bulk download as zip
      const zip = new JSZip();
      successfulImages.forEach((img, idx) => {
        // Ensure unique names if duplicates exist
        const nameParts = img.file.name.split('.');
        const ext = nameParts.pop();
        const base = nameParts.join('.');
        zip.file(`${base}_resized_${idx}.${ext}`, img.processedBlob!);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resized_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-full max-h-[800px]">
      
      {/* Left Sidebar - Settings */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 sticky top-6">
        
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Scaling className="w-5 h-5 text-indigo-500" />
            Resize Settings
          </h3>
          
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setMode('dimensions')}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${mode === 'dimensions' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              By Size
            </button>
            <button 
              onClick={() => setMode('percentage')}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${mode === 'percentage' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              As Percentage
            </button>
          </div>

          {mode === 'dimensions' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Width (px)</label>
                  <input 
                    type="number" 
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Auto"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Height (px)</label>
                  <input 
                    type="number" 
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Auto"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${lockAspectRatio ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
                  {lockAspectRatio && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={lockAspectRatio} 
                  onChange={(e) => setLockAspectRatio(e.target.checked)} 
                  className="hidden" 
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  Lock Aspect Ratio
                </span>
              </label>

              {!lockAspectRatio && (
                <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${backgroundFill ? 'bg-indigo-500 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
                      {backgroundFill && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={backgroundFill} 
                      onChange={(e) => setBackgroundFill(e.target.checked)} 
                      className="hidden" 
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Background Fill
                    </span>
                  </label>

                  {backgroundFill && (
                    <div className="pl-6 space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${fillType === 'color' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700'}`}>
                            {fillType === 'color' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">Pick a color</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">{fillColor}</span>
                          <input 
                            type="color" 
                            value={fillColor}
                            onChange={(e) => {
                              setFillColor(e.target.value);
                              setFillType('color');
                            }}
                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                          />
                        </div>
                        <input 
                          type="radio" 
                          checked={fillType === 'color'}
                          onChange={() => setFillType('color')}
                          className="hidden"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${fillType === 'transparent' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700'}`}>
                            {fillType === 'transparent' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">Transparent</span>
                        </div>
                        <div className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKhu/z/nwG7QlwYVTDIwKAGRjXwKCCxAAUA43Yx/1f/6+EAAAAASUVORK5CYII=')] opacity-50" />
                        <input 
                          type="radio" 
                          checked={fillType === 'transparent'}
                          onChange={() => setFillType('transparent')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scale</label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="200" 
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Export Settings</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Target File Size (KB) <span className="font-normal italic">(optional)</span></label>
            <input 
              type="number" 
              value={targetFileSizeKb}
              onChange={(e) => setTargetFileSizeKb(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="e.g. 500"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">Applies to JPEG/WEBP formats via compression.</p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handleExport}
            disabled={!hasImages || isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing {progress}%
              </>
            ) : (
              <>
                Export Image{images.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Main Area - Image Grid / Uploader */}
      <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
        
        {/* Dropzone Area */}
        <div 
          {...getRootProps()} 
          className={`shrink-0 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer mb-6 ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isDragActive ? "Drop images here..." : "Drag & drop images here"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            or click to browse from your device
          </p>
        </div>

        {/* Images Grid */}
        {hasImages ? (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  
                  {/* Remove Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-slate-900/90 hover:bg-red-500 hover:text-white text-slate-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Status Overlay */}
                  {img.status === 'processing' && (
                    <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  )}
                  {img.status === 'done' && (
                    <div className="absolute inset-0 z-10 bg-green-500/10 border-2 border-green-500 rounded-2xl pointer-events-none" />
                  )}

                  {/* Image Preview */}
                  <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
                    {/* Checkered background pattern for transparent PNGs */}
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKhu/z/nwG7QlwYVTDIwKAGRjXwKCCxAAUA43Yx/1f/6+EAAAAASUVORK5CYII=')] opacity-20 pointer-events-none" />
                    <img 
                      src={img.previewUrl} 
                      alt={img.file.name}
                      className="max-w-full max-h-full object-contain relative z-10 drop-shadow-md"
                    />
                  </div>
                  
                  {/* Info Footer */}
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1" title={img.file.name}>
                      {img.file.name}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] font-semibold">
                      <span className="text-slate-400 line-through decoration-rose-400 decoration-2">
                        {img.originalWidth}x{img.originalHeight}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        {img.targetWidth}x{img.targetHeight}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-sm font-medium">No images uploaded yet</p>
          </div>
        )}

      </div>
    </div>
  );
}
