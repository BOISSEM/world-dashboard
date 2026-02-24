export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ plan: 'FREE' });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  return NextResponse.json({ plan: user?.plan ?? 'FREE' });
}
