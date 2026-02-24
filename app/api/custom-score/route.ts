export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { LATEST_DATA_YEAR } from '@/lib/data-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(LATEST_DATA_YEAR));
    const indicatorIds = searchParams.get('indicatorIds')?.split(',') || [];

    if (indicatorIds.length === 0) {
      return NextResponse.json([]);
    }

    const countries = await prisma.country.findMany({
      include: {
        indicatorValues: {
          where: {
            year,
            indicatorId: { in: indicatorIds },
          },
        },
      },
    });

    const result = countries.map((country) => {
      const values = country.indicatorValues;
      
      if (values.length === 0) {
        return null;
      }

      // Calcul du score moyen pondéré
      const avgScore = values.reduce((sum, v) => sum + v.valueNorm, 0) / values.length;
      const coverage = values.length / indicatorIds.length;

      return {
        iso3: country.iso3,
        name: country.name,
        value: avgScore,
        coverageRatio: coverage,
      };
    }).filter(Boolean);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error computing custom score:', error);
    return NextResponse.json({ error: 'Failed to compute custom score' }, { status: 500 });
  }
}