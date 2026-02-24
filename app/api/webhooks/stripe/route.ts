export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const sig = headerPayload.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId;
      if (!clerkUserId) break;

      await prisma.user.update({
        where: { id: clerkUserId },
        data: {
          plan: 'PREMIUM',
          stripeCustomerId: session.customer as string,
          stripeSubId: session.subscription as string,
          stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;
      await prisma.user.updateMany({
        where: { stripeSubId: sub.id },
        data: { planExpiresAt: cancelAt },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubId: sub.id },
        data: { plan: 'FREE', stripeSubId: null, planExpiresAt: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
