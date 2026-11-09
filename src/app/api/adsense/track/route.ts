import { NextResponse } from 'next/server';
import { recordAdEvent } from '@/lib/adsenseService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placement, type } = body || {};

    if (!placement || !type) {
      return NextResponse.json({ success: false, error: 'Missing placement or type' }, { status: 400 });
    }

    if (type !== 'impression' && type !== 'click') {
      return NextResponse.json({ success: false, error: 'Invalid event type' }, { status: 400 });
    }

    await recordAdEvent(placement, type);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

