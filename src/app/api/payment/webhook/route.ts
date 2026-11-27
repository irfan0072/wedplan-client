import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/server-store';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('mock_stripe_webhook')) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not configured.' },
      { status: 500 }
    );
  }

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  let event;
  try {
    const rawBody = await req.text();
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const vendorId = session.metadata?.vendorId || session.client_reference_id;
      const vendorEmail = session.metadata?.vendorEmail || session.customer_email;

      if (session.payment_status === 'paid' && (vendorId || vendorEmail)) {
        const user = store.users.find(
          (u) =>
            (vendorId && (u._id === vendorId || u.id === vendorId)) ||
            (vendorEmail && u.email?.toLowerCase() === vendorEmail.toLowerCase())
        );

        if (user) {
          user.subscriptionPlan = 'premium';
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          user.subscriptionExpiresAt = expiresAt.toISOString();

          const existingTx = store.transactions.find((t) => t.stripeSessionId === session.id);
          if (!existingTx) {
            store.transactions.unshift({
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
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing Stripe webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
