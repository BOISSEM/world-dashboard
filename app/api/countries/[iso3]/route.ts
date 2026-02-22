// app/api/countries/[iso3]/route.ts

export const dynamic = 'force-dynamic';


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { iso3: string } }
) {
  try {
    const { iso3 } = params;

    const country = await prisma.country.findUnique({
      where: { iso3 },
      include: {
        indicatorValues: {
          include: {
            indicator: true,
          },
          orderBy: {
            year: 'desc',
          },
        },
        computedScores: {
          include: {
            profile: true,
          },
          orderBy: {
            year: 'desc',
          },
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
      { error: 'Failed to fetch country' },
      { status: 500 }
    );
  }
}