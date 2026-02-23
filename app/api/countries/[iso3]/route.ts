export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ iso3: string }> }
) {
  try {
    // IMPORTANT: await params dans Next.js 16+
    const { iso3 } = await context.params;

    const country = await prisma.country.findUnique({
      where: { iso3 },
      include: {
        indicatorValues: {
          include: {
            indicator: true,
          },
          orderBy: {
            valueNorm: 'desc',
          },
        },
        computedScores: {
          where: {
            profileId: 'default',
          },
          orderBy: {
            year: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country data' },
      { status: 500 }
    );
  }
}