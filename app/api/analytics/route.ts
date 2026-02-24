
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { LATEST_DATA_YEAR } from '@/lib/data-config';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      include: {
        computedScores: {
          where: {
            year: LATEST_DATA_YEAR,
            profileId: 'default',
          },
        },
        indicatorValues: {
          where: {
            year: LATEST_DATA_YEAR,
          },
        },
      },
    });

    const data = countries.map((country) => {
      const indicators: Record<string, number> = {};
      
      country.indicatorValues.forEach((iv) => {
        indicators[iv.indicatorId] = iv.valueNorm;
      });

      return {
        iso3: country.iso3,
        name: country.name,
        region: country.region,
        score: country.computedScores[0]?.score || 0,
        indicators,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}