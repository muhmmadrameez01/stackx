import { NextResponse } from 'next/server';
import { getAdSenseConfig, saveAdSenseConfig, getAdSenseAnalytics } from '@/lib/adsenseService';

function verifyAdmin(request: Request): boolean {
  const secretHeader = request.headers.get('x-admin-secret');
  const envSecret = process.env.ADMIN_SECRET_KEY || 'Allah@726';
  return secretHeader === envSecret;
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const config = getAdSenseConfig();
    const analytics = await getAdSenseAnalytics();

    return NextResponse.json({
      success: true,
      config,
      analytics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch AdSense data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = saveAdSenseConfig(body);

    return NextResponse.json({
      success: true,
      config: updated,
      message: 'Google AdSense settings updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to save AdSense settings' }, { status: 500 });
  }
}

