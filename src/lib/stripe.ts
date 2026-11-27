import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('MockStripeSecretKey')) {
    throw new Error(
      'Stripe is not configured. Please set a valid STRIPE_SECRET_KEY in environment variables.'
    );
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey);
  }

  return stripeInstance;
}
