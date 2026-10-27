import { NextResponse } from 'next/server';
import { createBlogPost, updateBlogPost } from '@/lib/blogService';

function verifyAdmin(request: Request): boolean {
  const secretHeader = request.headers.get('x-admin-secret');
  const envSecret = process.env.ADMIN_SECRET_KEY || 'tools726admin';
  return secretHeader === envSecret;
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ success: false, error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const post = await createBlogPost(body);
    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Post ID is required' }, { status: 400 });
    }

    const updated = await updateBlogPost(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, post: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update post' }, { status: 500 });
  }
}
