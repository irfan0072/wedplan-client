import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await verifyAuthRequest(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only vendors can upgrade to Premium.' },
        { status: 403 }
      );
    }

    const stripe = getStripeClient();

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      managed_payments: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'WedPlan Premium Vendor Subscription',
              description:
                'Publish unlimited active wedding services, verified premium badge, and priority placement.',
              tax_code: 'txcd_10103000',
              images: [
                'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
              ],
            },
            unit_amount: 4900, // $49.00 USD
          },
          quantity: 1,
        },
      ],
      client_reference_id: (user._id || user.id).toString(),
      customer_email: user.email,
      metadata: {
        vendorId: (user._id || user.id).toString(),
        vendorEmail: user.email,
        plan: 'premium',
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
