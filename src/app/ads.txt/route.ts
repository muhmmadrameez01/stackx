import { NextResponse } from 'next/server';
import { getAdSenseConfig } from '@/lib/adsenseService';

export async function GET() {
  const config = getAdSenseConfig();
  let content = config.adsTxt?.trim() || '';

  if (!content && config.publisherId) {
    const pubId = config.publisherId.replace(/^ca-/, '');
    content = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0`;
  }

  if (!content) {
    content = `# Google AdSense ads.txt - stackx.si\n# Add your Publisher ID in the Admin Panel Monetization tab\n`;
  }

  return new NextResponse(content + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

