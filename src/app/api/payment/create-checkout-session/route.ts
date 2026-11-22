import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json({ success: false, message: 'Forbidden: Vendors only.' }, { status: 403 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const mockSessionId = `cs_test_${Date.now()}`;
    const redirectUrl = `${proto}://${host}/payment/success?session_id=${mockSessionId}`;

    return NextResponse.json({
      success: true,
      url: redirectUrl,
      sessionId: mockSessionId,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
