import { auth } from '@clerk/nextjs/server';
import { prisma } from './db';

export async function getUserPlan(): Promise<'FREE' | 'PREMIUM'> {
  const { userId } = await auth();
  if (!userId) return 'FREE';
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.plan ?? 'FREE';
}
