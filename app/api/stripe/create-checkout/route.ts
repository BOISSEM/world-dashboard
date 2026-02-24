export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Upsert user in case the Clerk webhook hasn't fired yet
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/pricing?success=true`,
    cancel_url: `${appUrl}/pricing`,
    ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: email }),
    metadata: { clerkUserId: userId },
  });

  return NextResponse.json({ url: session.url });
}
