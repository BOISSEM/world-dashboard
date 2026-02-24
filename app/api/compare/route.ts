export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserPlan } from '@/lib/auth';
import { LATEST_DATA_YEAR } from '@/lib/data-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countriesParam = searchParams.get('countries');
    const year = parseInt(searchParams.get('year') || String(LATEST_DATA_YEAR));

    if (!countriesParam) {
      return NextResponse.json([]);
    }

    const plan = await getUserPlan();
    const maxCountries = plan === 'PREMIUM' ? 5 : 2;
    const countryIsos = countriesParam.split(',').slice(0, maxCountries);

    const countries = await prisma.country.findMany({
      where: {
        iso3: { in: countryIsos },
      },
      include: {
        indicatorValues: {
          where: { year },
          include: {
            indicator: true,
          },
        },
        computedScores: {
          where: {
            year,
            profileId: 'default',
          },
        },
      },
    });

    const result = countries.map((country) => {
      const indicators: Record<string, { value: number; valueNorm: number }> = {};

      country.indicatorValues.forEach((iv) => {
        indicators[iv.indicatorId] = {
          value: iv.value,
          valueNorm: iv.valueNorm,
        };
      });

      return {
        country: {
          iso3: country.iso3,
          name: country.name,
          region: country.region,
        },
        indicators,
        globalScore: country.computedScores[0]?.score,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison data' },
      { status: 500 }
    );
  }
}