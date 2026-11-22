import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Session ID required.' }, { status: 400 });
    }

    user.subscriptionPlan = 'premium';
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    user.subscriptionExpiresAt = expiresAt.toISOString();

    const tx = {
      _id: `tx_${Date.now()}`,
      id: `tx_${Date.now()}`,
      vendorId: user,
      plan: 'premium',
      amount: 49.0,
      currency: 'usd',
      stripeSessionId: sessionId,
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };

    store.transactions.unshift(tx);

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Welcome to WedPlan Premium!',
      transaction: tx,
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
