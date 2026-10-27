import { NextResponse } from 'next/server';
import { deleteBlogPost } from '@/lib/blogService';

function verifyAdmin(request: Request): boolean {
  const secretHeader = request.headers.get('x-admin-secret');
  const envSecret = process.env.ADMIN_SECRET_KEY || 'tools726admin';
  return secretHeader === envSecret;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteBlogPost(id);

  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Post not found or delete failed' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Post deleted successfully' });
}
