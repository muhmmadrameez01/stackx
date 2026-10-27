import React, { useState } from 'react';
import { DownloadCloud, Play, Link as LinkIcon, Loader2, AlertCircle, PlaySquare, Smartphone, Globe, Tv, Video, Music } from 'lucide-react';
import type { ToolId } from '../types';

interface VideoDownloaderProps {
  toolId: ToolId;
}

export const VideoDownloaderWorkspace: React.FC<VideoDownloaderProps> = ({ toolId }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaInfo, setMediaInfo] = useState<any | null>(null);

  const expectedPlatform = toolId.replace('-downloader', ''); // e.g. 'youtube', 'instagram'

  // Platform detection logic based on URL
  const detectPlatform = (input: string) => {
    if (input.includes('instagram.com')) return 'instagram';
    if (input.includes('facebook.com') || input.includes('fb.watch')) return 'facebook';
    if (input.includes('tiktok.com')) return 'tiktok';
    return 'unknown';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Smartphone className="w-5 h-5 text-pink-500" />;
      case 'facebook': return <Globe className="w-5 h-5 text-blue-500" />;
      case 'tiktok': return <Tv className="w-5 h-5 text-slate-800 dark:text-slate-200" />;
      default: return <LinkIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const detectedPlatform = url ? detectPlatform(url) : 'unknown';

    const getSanitizedFilename = (type: 'video' | 'audio', format: string) => {
      const baseName = mediaInfo?.title ? mediaInfo.title.replace(/[\\/:*?"<>|]/g, '').trim() : type;
      return `${baseName}.${format}`;
    };

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    setError(null);
    setMediaInfo(null);

    if (detectedPlatform !== expectedPlatform) {
      setError(`Invalid URL. Please enter a valid ${expectedPlatform.charAt(0).toUpperCase() + expectedPlatform.slice(1)} URL.`);
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch('/api/video/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        let msg = 'Failed to fetch media information.';
        try {
          const errData = await response.json();
          msg = errData.error || msg;
        } catch (e) {}
        throw new Error(msg);
      }

      const data = await response.json();
      
      if (data.status === 'error' || data.error) {
        throw new Error(data.error || data.text || 'This video cannot be accessed because it is private or requires authentication.');
      }

      setMediaInfo(data);
    } catch (err: any) {
      setError(err.message || 'The media could not be processed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 pb-20">
      
      {/* Header */}
      <div className="max-w-4xl w-full text-center mt-10 mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-6">
          <DownloadCloud className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Universal Video Downloader
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
          Download videos and audio from YouTube, Instagram, TikTok, and Facebook in high quality.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl w-full bg-white dark:bg-slate-800 rounded-3xl p-4 md:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 mb-8 relative z-10 overflow-hidden">
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {getPlatformIcon(expectedPlatform)}
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder={`Paste ${expectedPlatform.charAt(0).toUpperCase() + expectedPlatform.slice(1)} video URL here...`}
            className="w-full pl-12 pr-24 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <div className="absolute right-2 flex items-center gap-2">
            {url && (
              <button
                onClick={() => { setUrl(''); setMediaInfo(null); setError(null); }}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-700 rounded-xl"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!url || isAnalyzing}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-3xl w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1 whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {mediaInfo && (
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Media Preview Card */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
              {mediaInfo.thumbnail ? (
                <div className="aspect-video w-full bg-slate-900 relative">
                  <img src={mediaInfo.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  {mediaInfo.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded">
                      {mediaInfo.duration}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <Video className="w-8 h-8 text-slate-300" />
                </div>
              )}
              
              <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-2" title={mediaInfo.title}>
                  {mediaInfo.title || 'Video Title'}
                </h3>
                {mediaInfo.author && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    {getPlatformIcon(expectedPlatform)} {mediaInfo.author}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
            
            {/* Video Options */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-500" /> Video
              </h3>
              
              <div className="flex flex-col gap-2">
                {mediaInfo.videos?.length > 0 ? (
                  mediaInfo.videos.map((vid: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {vid.quality} {vid.format && <span className="text-xs text-slate-400 font-medium ml-1">({vid.format})</span>}
                        </span>
                      </div>
                      <a href={`/api/video/download?url=${encodeURIComponent(vid.url)}&filename=${encodeURIComponent(getSanitizedFilename('video', vid.format))}`} download className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1">
                        <DownloadCloud className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No video formats available.</p>
                )}
              </div>
            </div>

            {/* Audio Options */}
            {mediaInfo.audios?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg mt-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Music className="w-4 h-4 text-pink-500" /> Audio
                </h3>
                
                <div className="flex flex-col gap-2">
                  {mediaInfo.audios.map((aud: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{aud.quality} {aud.format && <span className="text-xs text-slate-400 font-medium ml-1">({aud.format})</span>}</span>
                      <a href={`/api/video/download?url=${encodeURIComponent(aud.url)}&filename=${encodeURIComponent(getSanitizedFilename('audio', aud.format))}`} download className="px-4 py-1.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1">
                        <DownloadCloud className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
