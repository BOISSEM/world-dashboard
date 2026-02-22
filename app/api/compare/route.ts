// app/api/compare/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const iso3Codes = searchParams.get('countries')?.split(',') || [];
    const year = parseInt(searchParams.get('year') || '2023');

    if (iso3Codes.length === 0) {
      return NextResponse.json(
        { error: 'At least one country required' },
        { status: 400 }
      );
    }

    const data = await prisma.country.findMany({
      where: {
        iso3: {
          in: iso3Codes,
        },
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison data' },
      { status: 500 }
    );
  }
}