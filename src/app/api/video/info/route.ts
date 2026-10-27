import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import util from 'util';

const execFileAsync = util.promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ status: 'error', error: 'URL is required' }, { status: 400 });
    }

    let formatData: any = null;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

    if (isYouTube) {
      return NextResponse.json({ status: 'error', error: 'YouTube downloads are currently not supported by this tool.' }, { status: 400 });
    }

    const isTikTok = url.includes('tiktok.com');
    if (isTikTok) {
      try {
        const tikRes = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const tikData = await tikRes.json();
        
        if (tikData.code === 0 && tikData.data) {
          const videos = [];
          if (tikData.data.play) {
            videos.push({ quality: 'No Watermark', format: 'mp4', url: tikData.data.play, hasAudio: true });
          }
          if (tikData.data.wmplay) {
            videos.push({ quality: 'Watermarked', format: 'mp4', url: tikData.data.wmplay, hasAudio: true });
          }
          
          const audios = [];
          if (tikData.data.music) {
            audios.push({ quality: 'Original Audio', format: 'mp3', url: tikData.data.music });
          }

          return NextResponse.json({
            status: 'success',
            title: tikData.data.title || 'TikTok Video',
            author: tikData.data.author?.nickname || 'TikTok User',
            thumbnail: tikData.data.cover,
            duration: tikData.data.duration ? `${tikData.data.duration}s` : '',
            videos,
            audios
          });
        }
      } catch (err: any) {
        console.warn('TikWM API failed, falling back to yt-dlp:', err.message);
      }
    }

    if (!formatData) {
      const ytdlpPath = path.join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe');
      try {
        // Fetch video info with 15s timeout
        const { stdout } = await execFileAsync(ytdlpPath, [
          '--dump-single-json',
          '--no-warnings',
          '--no-check-certificate',
          '--no-playlist',
          url
        ], { 
          maxBuffer: 10 * 1024 * 1024,
          timeout: 15000 // 15 seconds timeout
        });
        formatData = JSON.parse(stdout);
      } catch (ytError: any) {
        console.warn('yt-dlp extraction failed or timed out:', ytError.message);
        throw new Error('Video processing failed due to bot protection or timeout. Please try another link.');
      }
    }

    // Process formats to extract available Video & Audio qualities
    const videos: any[] = [];
    const audios: any[] = [];
    
    if (formatData.formats) {
      // Audio only
      const audioFormats = formatData.formats.filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none');
      // Video (with or without audio)
      const videoFormats = formatData.formats.filter((f: any) => f.vcodec !== 'none');

      // Sort and map videos
      videoFormats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0)).forEach((f: any) => {
        // Prevent massive duplicate lists, grab the best of each height
        if (f.height && f.url && !videos.find(v => v.quality === `${f.height}p`)) {
          videos.push({
            quality: `${f.height}p`,
            format: f.ext,
            url: f.url,
            itag: f.itag,
            hasAudio: f.acodec !== 'none'
          });
        }
      });

      // Sort and map audios
      audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0)).forEach((f: any) => {
        if (f.abr && f.url && !audios.find(a => a.quality === `${Math.round(f.abr)} kbps`)) {
          audios.push({
            quality: `${Math.round(f.abr)} kbps`,
            format: f.ext,
            url: f.url,
            itag: f.itag
          });
        }
      });
    }

    // Format duration nicely (e.g. 03:24)
    const formatDuration = (seconds: number) => {
      if (!seconds) return '';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const response = {
      status: 'success',
      title: formatData.title,
      author: formatData.uploader || formatData.channel || formatData.creator,
      thumbnail: formatData.thumbnail,
      duration: formatDuration(formatData.duration),
      videos: videos.length > 0 ? videos : (formatData.url ? [{ quality: 'Original', format: formatData.ext, url: formatData.url }] : []),
      audios: audios
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Video Info Fetch Error:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Failed to extract video information. The video might be private or unsupported.' },
      { status: 500 }
    );
  }
}
