import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const ytUrl = req.nextUrl.searchParams.get('ytUrl');
  const itag = req.nextUrl.searchParams.get('itag');
  const filename = req.nextUrl.searchParams.get('filename') || 'download.mp4';
  const isAudio = filename.endsWith('.m4a') || filename.endsWith('.webm') || filename.endsWith('.mp3');

  if (!url && !ytUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (isAudio && filename.endsWith('.m4a')) {
      headers.set('Content-Type', 'audio/mp4');
    } else if (isAudio && filename.endsWith('.webm')) {
      headers.set('Content-Type', 'audio/webm');
    } else {
      headers.set('Content-Type', 'video/mp4');
    }

    if (ytUrl) {
      return new NextResponse('YouTube downloads are currently not supported.', { status: 400 });
    }

    // Fallback for TikTok, Instagram, Facebook (Direct URL fetch)
    const userAgent = req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    
    let referer = 'https://google.com/';
    if (url!.includes('tiktok')) referer = 'https://www.tiktok.com/';
    if (url!.includes('instagram')) referer = 'https://www.instagram.com/';
    if (url!.includes('facebook') || url!.includes('fbcdn')) referer = 'https://www.facebook.com/';

    const response = await fetch(url!, {
      headers: {
        'User-Agent': userAgent,
        'Referer': referer,
        'Origin': referer
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    // Merge remote headers with our disposition headers
    const proxyHeaders = new Headers(response.headers);
    proxyHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (isAudio && filename.endsWith('.m4a')) proxyHeaders.set('Content-Type', 'audio/mp4');
    else if (isAudio && filename.endsWith('.webm')) proxyHeaders.set('Content-Type', 'audio/webm');
    else proxyHeaders.set('Content-Type', 'video/mp4');

    return new NextResponse(response.body, {
      status: 200,
      headers: proxyHeaders
    });
  } catch (error: any) {
    console.error('Download Proxy Error:', error);
    return new NextResponse(`Download failed: ${error.message}`, { status: 500 });
  }
}
