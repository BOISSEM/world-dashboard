export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countriesParam = searchParams.get('countries');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    if (!countriesParam) {
      return NextResponse.json([]);
    }

    const countryIsos = countriesParam.split(',');

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