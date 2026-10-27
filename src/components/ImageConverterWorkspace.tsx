import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
}

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'favicon';

export function ImageConverterWorkspace() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>('image/jpeg');
  const [quality, setQuality] = useState<number>(90);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle' as const
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/svg+xml': []
    }
  });

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const convertImage = async (imgFile: ImageFile, format: OutputFormat): Promise<{ blob: Blob, name: string }[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas 2D context failed'));

        if (format === 'image/jpeg') {
          // Fill white background for transparent images converted to JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const originalName = imgFile.file.name.split('.')[0];

        if (format === 'favicon') {
          // Generate multiple sizes
          const sizes = [16, 32, 192, 512];
          const results: { blob: Blob, name: string }[] = [];
          let processed = 0;

          sizes.forEach(size => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = size;
            tempCanvas.height = size;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(img, 0, 0, size, size);
              tempCanvas.toBlob(b => {
                if (b) results.push({ blob: b, name: `favicon-${size}x${size}.png` });
                processed++;
                if (processed === sizes.length) resolve(results);
              }, 'image/png');
            }
          });
        } else {
          canvas.toBlob(b => {
            if (b) {
              const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
              resolve([{ blob: b, name: `${originalName}_converted.${ext}` }]);
            } else {
              reject(new Error('Conversion failed'));
            }
          }, format, quality / 100);
        }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = imgFile.previewUrl;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const zip = new JSZip();
    let hasGeneratedFiles = false;
    let singleOutput: { blob: Blob, name: string } | null = null;

    const updated = [...images];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'processing';
      setImages([...updated]);

      try {
        const results = await convertImage(updated[i], targetFormat);
        updated[i].status = 'done';

        results.forEach(res => {
          zip.file(res.name, res.blob);
          hasGeneratedFiles = true;
          singleOutput = res; // Save last one in case it's a single file
        });
      } catch (err) {
        console.error(err);
        updated[i].status = 'error';
      }

      setProgress(Math.round(((i + 1) / updated.length) * 100));
      setImages([...updated]);
    }

    if (hasGeneratedFiles) {
      if (images.length === 1 && targetFormat !== 'favicon' && singleOutput) {
        // Download single file
        const out = singleOutput as { blob: Blob, name: string };
        const url = URL.createObjectURL(out.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = out.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = targetFormat === 'favicon' ? 'favicon_package.zip' : 'converted_images.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }

    setIsProcessing(false);
  };

  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-full min-h-[600px]">

      {/* Left Sidebar - Settings */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 sticky top-6">

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <RefreshCcw className="w-5 h-5 text-indigo-500" />
            Conversion Output
          </h3>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-950">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">JPG</span>
              <input type="radio" checked={targetFormat === 'image/jpeg'} onChange={() => setTargetFormat('image/jpeg')} className="accent-indigo-600" />
            </label>
            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-950">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">PNG</span>
              <input type="radio" checked={targetFormat === 'image/png'} onChange={() => setTargetFormat('image/png')} className="accent-indigo-600" />
            </label>
            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-950">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">WEBP</span>
              <input type="radio" checked={targetFormat === 'image/webp'} onChange={() => setTargetFormat('image/webp')} className="accent-indigo-600" />
            </label>
            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20">
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Favicon Package (.zip)</span>
              <input type="radio" checked={targetFormat === 'favicon'} onChange={() => setTargetFormat('favicon')} className="accent-indigo-600" />
            </label>
          </div>
        </div>

        {targetFormat !== 'image/png' && targetFormat !== 'favicon' && (
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500">Quality</label>
              <span className="text-xs font-bold text-indigo-600">{quality}%</span>
            </div>
            <input
              type="range"
              min="10" max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}

        <div className="mt-auto pt-4">
          <button
            onClick={handleConvert}
            disabled={!hasImages || isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting {progress}%
              </>
            ) : (
              <>
                Convert Image{images.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Main Area - Image Grid / Uploader */}
      <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">

        {/* Dropzone Area */}
        <div
          {...getRootProps()}
          className={`shrink-0 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer mb-6 ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isDragActive ? "Drop images here..." : "Drag & drop SVG, PNG, JPG, WEBP"}
          </p>
        </div>

        {/* Images Grid */}
        {hasImages ? (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">

                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-slate-900/90 hover:bg-red-500 hover:text-white text-slate-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {img.status === 'processing' && (
                    <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  )}
                  {img.status === 'done' && (
                    <div className="absolute inset-0 z-10 bg-green-500/10 border-2 border-green-500 rounded-2xl pointer-events-none" />
                  )}

                  <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKhu/z/nwG7QlwYVTDIwKAGRjXwKCCxAAUA43Yx/1f/6+EAAAAASUVORK5CYII=')] opacity-20 pointer-events-none" />
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className="max-w-full max-h-full object-contain relative z-10 drop-shadow-md"
                    />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={img.file.name}>
                      {img.file.name}
                    </p>
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
