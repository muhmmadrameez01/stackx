import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function verifyAdmin(request: Request): boolean {
  const secretHeader = request.headers.get('x-admin-secret');
  const envSecret = process.env.ADMIN_SECRET_KEY || 'Allah@726';
  return secretHeader === envSecret;
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Check size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName).toLowerCase() || '.png';

    if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only images are supported.' }, { status: 400 });
    }

    const safeBase = originalName
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 30) || 'blog-image';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const filename = `${safeBase}-${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to upload image' }, { status: 500 });
  }
}

