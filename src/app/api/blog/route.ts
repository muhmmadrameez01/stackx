import { NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/blogService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;

  const posts = await getPublishedPosts(query, category);
  return NextResponse.json({ success: true, posts });
}
