// app/api/map-data/route.ts

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorId = searchParams.get('indicatorId');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const useGlobalScore = searchParams.get('useGlobalScore') === 'true';

    if (useGlobalScore) {
      const scores = await prisma.computedScore.findMany({
        where: {
          year,
          profileId: 'default',
        },
        include: {
          country: true,
        },
      });

      return NextResponse.json(
        scores.map((s) => ({
          iso3: s.iso3,
          name: s.country.name,
          value: s.score,
          coverageRatio: s.coverageRatio,
        }))
      );
    }

    if (!indicatorId) {
      return NextResponse.json(
        { error: 'indicatorId or useGlobalScore required' },
        { status: 400 }
      );
    }

    const values = await prisma.countryIndicatorValue.findMany({
      where: {
        indicatorId,
        year,
      },
      include: {
        country: true,
      },
    });

    return NextResponse.json(
      values.map((v) => ({
        iso3: v.iso3,
        name: v.country.name,
        value: v.valueNorm,
        rawValue: v.value,
      }))
    );
  } catch (error) {
    console.error('Error fetching map data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}