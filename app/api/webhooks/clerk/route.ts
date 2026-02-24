export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
  };
};

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();

  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const { type, data } = event;

  if (type === 'user.created') {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    if (!primaryEmail) {
      return NextResponse.json({ error: 'No primary email' }, { status: 400 });
    }
    await prisma.user.create({
      data: {
        id: data.id,
        email: primaryEmail.email_address,
      },
    });
  }

  if (type === 'user.deleted') {
    await prisma.user.delete({ where: { id: data.id } }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
