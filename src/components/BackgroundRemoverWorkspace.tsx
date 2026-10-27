import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Loader2, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { removeBackground } from '@imgly/background-removal';

export const BackgroundRemoverWorkspace: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
  });

  const handleRemoveBackground = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressText('Initializing AI Model...');
    setError(null);

    try {
      // img.ly background removal uses WASM and requires fetch to load models
      const imageBlob = await removeBackground(image, {
        publicPath: `${window.location.origin}/static/bg-removal-data/`,
        model: 'medium',
        output: {
          format: 'image/png',
          quality: 1.0
        },
        progress: (key, current, total) => {
          const ratio = current / total;
          setProgress(Math.round(ratio * 100));
          if (key.includes('fetch')) {
            setProgressText(`Downloading AI Model (${Math.round(ratio * 100)}%)... (First time only)`);
          } else {
            setProgressText('Processing Image...');
          }
        }
      });

      const url = URL.createObjectURL(imageBlob);
      setResultUrl(url);
      setProgressText('Done!');
    } catch (err: any) {
      console.error('Background removal failed:', err);
      setError(err.message || 'Failed to remove background. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !image) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const baseName = image.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-removed-bg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setImage(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  };

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  return (
    <div className="w-full flex flex-col items-center">
      {!image ? (
        <div 
          {...getRootProps()} 
          className={`w-full max-w-3xl aspect-[16/9] border-3 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${
            isDragActive 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload an image'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
            Drag and drop your photo here, or click to browse. Supported formats: JPG, PNG, WEBP.
          </p>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
            Select Image
          </button>
        </div>
      ) : (
        <div className="w-full max-w-5xl">
          
          {error && (
            <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 font-medium text-sm text-center border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Original Image */}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Original Image
              </h3>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner aspect-[4/3] flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700 relative">
                {previewUrl && (
                  <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-xl" />
                )}
                <button 
                  onClick={handleReset}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-lg shadow-sm transition-all"
                  title="Upload different image"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Result Image */}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Background Removed
              </h3>
              
              <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner aspect-[4/3] flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-700 relative"
                   style={resultUrl ? {
                     backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                   } : {}}>
                
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center w-full max-w-xs p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">{progressText}</span>
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="Background Removed" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            {!resultUrl && !isProcessing && (
              <button
                onClick={handleRemoveBackground}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" /> Remove Background
              </button>
            )}

            {resultUrl && !isProcessing && (
              <button
                onClick={handleDownload}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-3"
              >
                <Download className="w-5 h-5" /> Download HD Image
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
