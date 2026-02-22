// app/country/[iso3]/page.tsx
import { prisma } from '@/lib/db';
import CountryKPIBand from '@/components/country/CountryKPIBand';
import ThematicCards from '@/components/country/ThematicCards';
import IndicatorTable from '@/components/country/IndicatorTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface PageProps {
  params: {
    iso3: string;
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { iso3 } = params;

  const country = await prisma.country.findUnique({
    where: { iso3 },
    include: {
      indicatorValues: {
        where: { year: 2023 },
        include: {
          indicator: true,
        },
      },
      computedScores: {
        where: {
          year: 2023,
          profileId: 'default',
        },
      },
    },
  });

  if (!country) {
    return <div>Country not found</div>;
  }

  const globalScore = country.computedScores[0];
  const coverageRatio = globalScore?.coverageRatio || 0;

  // Prepare KPIs
  const kpis = [
    {
      label: 'Global Score',
      value: globalScore?.score || 0,
    },
    {
      label: 'Indicators Covered',
      value: country.indicatorValues.length,
    },
    {
      label: 'Coverage Ratio',
      value: coverageRatio * 100,
      unit: '%',
    },
  ];

  // Prepare thematic data
  const thematicData = country.indicatorValues.map((iv) => ({
    name: iv.indicator.name,
    value: iv.value,
    valueNorm: iv.valueNorm,
    theme: iv.indicator.theme,
  }));

  // Prepare table data
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

        {coverageRatio >= 0.7 && globalScore ? (
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
                {formatNumber(coverageRatio * 100, 0)}%). Minimum 70% required.
              </p>
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