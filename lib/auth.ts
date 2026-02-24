import { auth } from '@clerk/nextjs/server';
import { prisma } from './db';

export async function getUserPlan(): Promise<'FREE' | 'PREMIUM'> {
  const { userId } = await auth();
  if (!userId) return 'FREE';

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return 'FREE';

  // Downgrade if access has expired
  if (user.plan === 'PREMIUM' && user.planExpiresAt && user.planExpiresAt < new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'FREE', planExpiresAt: null },
    });
    return 'FREE';
  }

  return user.plan ?? 'FREE';
}
