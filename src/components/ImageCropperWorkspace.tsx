import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Crop as CropIcon, Download, X, Image as ImageIcon } from 'lucide-react';

export function ImageCropperWorkspace() {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [isCircular, setIsCircular] = useState(false);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      setCrop(undefined); // Reset crop state
      
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
      mediaWidth,
      mediaHeight
    );
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const handleDownload = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Pixel ratio for high quality
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    if (isCircular) {
      ctx.beginPath();
      ctx.arc(
        cropWidth / 2,
        cropHeight / 2,
        Math.min(cropWidth, cropHeight) / 2,
        0,
        2 * Math.PI
      );
      ctx.clip();
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped_${fileName || 'image.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png', 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-full min-h-[600px]">
      
      {/* Left Sidebar - Settings */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 sticky top-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <CropIcon className="w-5 h-5 text-indigo-500" />
            Crop Settings
          </h3>
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setAspect(undefined); setIsCircular(false); }}
                className={`p-2 text-sm font-bold border rounded-xl transition-colors ${!aspect && !isCircular ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
              >
                Free Form
              </button>
              <button 
                onClick={() => { setAspect(1); setIsCircular(false); if(imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, 1)); }}
                className={`p-2 text-sm font-bold border rounded-xl transition-colors ${aspect === 1 && !isCircular ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
              >
                1:1 (Square)
              </button>
              <button 
                onClick={() => { setAspect(16 / 9); setIsCircular(false); if(imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, 16/9)); }}
                className={`p-2 text-sm font-bold border rounded-xl transition-colors ${aspect === 16/9 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
              >
                16:9
              </button>
              <button 
                onClick={() => { setAspect(4 / 3); setIsCircular(false); if(imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, 4/3)); }}
                className={`p-2 text-sm font-bold border rounded-xl transition-colors ${aspect === 4/3 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
              >
                4:3
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={isCircular} 
                onChange={(e) => {
                  setIsCircular(e.target.checked);
                  if (e.target.checked) {
                    setAspect(1);
                    if(imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, 1));
                  }
                }} 
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" 
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Circular Crop
              </span>
            </label>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleDownload}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Cropped
          </button>
          {imgSrc && (
            <button
              onClick={() => { setImgSrc(''); setFileName(''); }}
              className="w-full mt-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold py-2 px-4 rounded-xl transition-colors text-sm"
            >
              Cancel & Upload New
            </button>
          )}
        </div>
      </div>

      {/* Main Cropper Area */}
      <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
        {!imgSrc ? (
          <div 
            {...getRootProps()} 
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
              Drop an image here to crop
            </p>
            <p className="text-sm text-slate-500">
              or click to browse your files
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden p-4 relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKhu/z/nwG7QlwYVTDIwKAGRjXwKCCxAAUA43Yx/1f/6+EAAAAASUVORK5CYII=')]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={isCircular}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[60vh] w-auto max-w-full drop-shadow-lg"
              />
            </ReactCrop>
          </div>
        )}
      </div>

    </div>
  );
}
