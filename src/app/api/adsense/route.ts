import { NextResponse } from 'next/server';
import { getAdSenseConfig } from '@/lib/adsenseService';

export async function GET() {
  try {
    const config = getAdSenseConfig();
    return NextResponse.json({
      enabled: config.enabled,
      publisherId: config.publisherId,
      autoAds: config.autoAds,
      testMode: config.testMode,
      slots: config.slots,
    });
  } catch (err: any) {
    return NextResponse.json({ enabled: false, publisherId: '', error: err.message }, { status: 500 });
  }
}

