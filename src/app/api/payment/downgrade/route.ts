import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthHeader, generateToken, handleApiError } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only vendors can manage subscription plans.' },
        { status: 403 }
      );
    }

    user.subscriptionPlan = 'free';
    user.subscriptionExpiresAt = null;

    const freshToken = generateToken(user);
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Subscription switched back to Free Plan.',
      user: safeUser,
      token: freshToken,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
