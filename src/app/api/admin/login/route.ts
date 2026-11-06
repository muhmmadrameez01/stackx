import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@stackx.si';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Allah@726';
    const secretKey = process.env.ADMIN_SECRET_KEY || 'Allah@726';

    if (
      email &&
      password &&
      email.trim().toLowerCase() === expectedEmail.trim().toLowerCase() &&
      password === expectedPassword
    ) {
      return NextResponse.json({
        success: true,
        secretKey: secretKey,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email address or password.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
