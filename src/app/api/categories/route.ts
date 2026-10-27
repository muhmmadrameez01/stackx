import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/blogService';

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json({ success: true, categories });
}
