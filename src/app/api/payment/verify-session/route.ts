import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader, generateToken, handleApiError } from '@/lib/server-store';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Stripe Session ID is required.' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, message: 'Payment has not been completed or verified by Stripe.' },
        { status: 400 }
      );
    }

    const sessionVendorId = session.metadata?.vendorId || session.client_reference_id;
    const sessionEmail = session.metadata?.vendorEmail || session.customer_email;
    const currentUserId = (user._id || user.id).toString();

    if (
      sessionVendorId !== currentUserId &&
      sessionEmail?.toLowerCase() !== user.email?.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, message: 'Checkout session does not belong to the authenticated vendor.' },
        { status: 403 }
      );
    }

    user.subscriptionPlan = 'premium';
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    user.subscriptionExpiresAt = expiresAt.toISOString();

    let tx = store.transactions.find((t) => t.stripeSessionId === session.id);
    if (!tx) {
      tx = {
        _id: `tx_${Date.now()}`,
        id: `tx_${Date.now()}`,
        vendorId: user,
        plan: 'premium',
        amount: (session.amount_total || 4900) / 100,
        currency: session.currency || 'usd',
        stripeSessionId: session.id,
        stripeSubscriptionId: (session.subscription as string) || '',
        status: 'succeeded',
        createdAt: new Date().toISOString(),
      };
      store.transactions.unshift(tx);
    }

    const freshToken = generateToken(user);
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Welcome to WedPlan Premium!',
      transaction: tx,
      user: safeUser,
      token: freshToken,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
