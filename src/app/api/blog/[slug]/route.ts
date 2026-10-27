import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/blogService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, post });
}
