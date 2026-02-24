// app/country/[iso3]/page.tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import CountryKPIBand from '@/components/country/CountryKPIBand';
import ThematicCards from '@/components/country/ThematicCards';
import IndicatorTable from '@/components/country/IndicatorTable';
import ScoreHistoryChart from '@/components/country/ScoreHistoryChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { LATEST_DATA_YEAR } from '@/lib/data-config';

interface PageProps {
  params: Promise<{ iso3: string }>;
}

export async function generateStaticParams() {
  const countries = await prisma.country.findMany({ select: { iso3: true } });
  return countries.map((c) => ({ iso3: c.iso3 }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { iso3 } = await params;

  const country = await prisma.country.findUnique({
    where: { iso3 },
    select: {
      name: true,
      region: true,
      computedScores: {
        where: { year: LATEST_DATA_YEAR, profileId: 'default' },
        select: { score: true, coverageRatio: true },
        take: 1,
      },
    },
  });

  if (!country) return { title: 'Country Not Found' };

  const score = country.computedScores[0]?.score;
  const scoreText = score != null ? ` — Score ${score.toFixed(0)}/100` : '';
  const title = `${country.name}${scoreText}`;
  const description = `${country.name} country profile: global ranking, economy, health, education, environment and quality of life indicators. Region: ${country.region}.`;

  const ogParams = new URLSearchParams({ name: country.name, region: country.region });
  if (score != null) ogParams.set('score', score.toFixed(0));
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/country/${iso3}`,
    },
    openGraph: {
      title: `${title} | World Rankings`,
      description,
      url: `/country/${iso3}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | World Rankings`,
      description,
      images: [ogImage],
    },
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { iso3 } = await params;

  const [country, historicalScores] = await Promise.all([
    prisma.country.findUnique({
      where: { iso3 },
      include: {
        indicatorValues: {
          where: { year: LATEST_DATA_YEAR },
          include: { indicator: true },
        },
        computedScores: {
          where: { year: LATEST_DATA_YEAR, profileId: 'default' },
        },
      },
    }),
    prisma.computedScore.findMany({
      where: { iso3, profileId: 'default', year: { lt: LATEST_DATA_YEAR } },
      orderBy: { year: 'asc' },
      select: { year: true, score: true },
    }),
  ]);

  if (!country) {
    return <div>Country not found</div>;
  }

  const globalScore = country.computedScores[0];
  const coverageRatio = globalScore?.coverageRatio || 0;

  const kpis = [
    { label: 'Global Score', value: globalScore?.score || 0 },
    { label: 'Indicators Covered', value: country.indicatorValues.length },
    { label: 'Coverage Ratio', value: coverageRatio * 100, unit: '%' },
  ];

  const thematicData = country.indicatorValues.map((iv) => ({
    name: iv.indicator.name,
    value: iv.value,
    valueNorm: iv.valueNorm,
    theme: iv.indicator.theme,
  }));

  const tableData = country.indicatorValues.map((iv) => ({
    name: iv.indicator.name,
    theme: iv.indicator.theme,
    value: iv.value,
    valueNorm: iv.valueNorm,
    sourceName: iv.indicator.sourceName,
    sourceUrl: iv.indicator.sourceUrl,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{country.name}</h1>
          <p className="text-gray-600">{country.region}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CountryKPIBand kpis={kpis} />

        {coverageRatio >= 0.5 && globalScore ? (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Global Score Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {formatNumber(globalScore.score, 1)}
              </div>
              <p className="text-sm text-gray-600">
                This score is computed from {country.indicatorValues.length}{' '}
                indicators with {formatNumber(coverageRatio * 100, 0)}% coverage.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700">
                Global score not displayed due to insufficient data coverage (
                {formatNumber(coverageRatio * 100, 0)}%). Minimum 50% required.
              </p>
            </CardContent>
          </Card>
        )}

        {historicalScores.length >= 2 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Score Evolution</CardTitle>
              <p className="text-xs text-gray-500">Based on World Bank indicators (2015–2025)</p>
            </CardHeader>
            <CardContent>
              <ScoreHistoryChart data={historicalScores} />
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Indicators by Theme</h2>
          <ThematicCards indicators={thematicData} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Indicators</h2>
          <IndicatorTable indicators={tableData} />
        </div>
      </main>
    </div>
  );
}
