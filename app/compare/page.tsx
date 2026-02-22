// app/compare/page.tsx
'use client';

import { useEffect, useState } from 'react';
import CompareSelector from '@/components/compare/CompareSelector';
import ComparisonTable from '@/components/compare/ComparisonTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Country {
  iso3: string;
  name: string;
}

export default function ComparePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [showNormalized, setShowNormalized] = useState(true);
  const [indicatorNames, setIndicatorNames] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(data));

    fetch('/api/indicators')
      .then((res) => res.json())
      .then((data) => {
        const names = data.reduce((acc: any, ind: any) => {
          acc[ind.id] = ind.name;
          return acc;
        }, {});
        setIndicatorNames(names);
      });
  }, []);

  useEffect(() => {
    if (selectedCountries.length === 0) {
      setComparisonData([]);
      return;
    }

    const params = new URLSearchParams({
      countries: selectedCountries.join(','),
      year: '2023',
    });

    fetch(`/api/compare?${params}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((country: any) => {
          const indicators = country.indicatorValues.reduce(
            (acc: any, iv: any) => {
              acc[iv.indicatorId] = {
                value: iv.value,
                valueNorm: iv.valueNorm,
              };
              return acc;
            },
            {}
          );

          return {
            country: country.name,
            globalScore: country.computedScores[0]?.score,
            indicators,
          };
        });
        setComparisonData(formatted);
      });
  }, [selectedCountries]);

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
          <h1 className="text-3xl font-bold">Compare Countries</h1>
          <p className="text-gray-600">
            Select multiple countries to compare their indicators
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <CompareSelector
              countries={countries}
              selectedCountries={selectedCountries}
              onSelectionChange={setSelectedCountries}
            />
          </CardContent>
        </Card>

        {comparisonData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comparison Results</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowNormalized(!showNormalized)}
                >
                  {showNormalized ? 'Show Raw Values' : 'Show Normalized'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonTable
                data={comparisonData}
                showNormalized={showNormalized}
                indicatorNames={indicatorNames}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}