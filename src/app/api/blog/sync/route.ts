import { NextResponse } from 'next/server';
import { syncScheduledPosts } from '@/lib/blogService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const publishedCount = await syncScheduledPosts();
    return NextResponse.json({
      success: true,
      message: `Sync completed. ${publishedCount} scheduled posts were automatically published.`,
      publishedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

