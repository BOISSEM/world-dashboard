'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import CompareSelector from '@/components/compare/CompareSelector';
import ComparisonTable from '@/components/compare/ComparisonTable';
import IndicatorFilter from '@/components/map/IndicatorFilter';
import { UserButton } from '@clerk/nextjs';
import PremiumGate from '@/components/PremiumGate';

interface Country {
  iso3: string;
  name: string;
  region: string;
}

interface Indicator {
  id: string;
  name: string;
  theme: string;
}

interface ComparisonData {
  country: Country;
  indicators: Record<string, { value: number; valueNorm: number }>;
  globalScore?: number;
}

export default function ComparePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [showRawValues, setShowRawValues] = useState(false);
  const [plan, setPlan] = useState<'FREE' | 'PREMIUM'>('FREE');

  useEffect(() => {
    fetch('/api/user/plan')
      .then((r) => r.json())
      .then((d) => setPlan(d.plan));
  }, []);

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(data));

    fetch('/api/indicators')
      .then((res) => res.json())
      .then((data) => {
        setIndicators(data);
        // Sélectionner tous les indicateurs par défaut
        setSelectedIndicators(data.map((i: Indicator) => i.id));
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
      .then((data) => setComparisonData(data));
  }, [selectedCountries]);

  // Filtrer les données selon les indicateurs sélectionnés
const filteredComparisonData = comparisonData.map((item) => {
  const filteredIndicators: Record<string, { value: number; valueNorm: number }> = {};
  
  // Vérification que item.indicators existe
  if (item.indicators) {
    selectedIndicators.forEach((indicatorId) => {
      if (item.indicators[indicatorId]) {
        filteredIndicators[indicatorId] = item.indicators[indicatorId];
      }
    });
  }

  return {
    ...item,
    indicators: filteredIndicators,
  };
});


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Map
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Compare Countries</h1>
              <p className="text-sm text-gray-600 mt-1">
                Select multiple countries and indicators to compare
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sélection des pays */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Select Countries (max {plan === 'PREMIUM' ? 5 : 2})
              </CardTitle>
              {plan === 'FREE' && (
                <Link href="/pricing" className="text-xs text-indigo-600 font-medium hover:underline">
                  Premium → jusqu'à 5 pays
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CompareSelector
              countries={countries}
              selectedCountries={selectedCountries}
              onSelectionChange={(isos) =>
                setSelectedCountries(
                  plan === 'PREMIUM' ? isos.slice(0, 5) : isos.slice(0, 2)
                )
              }
            />
          </CardContent>
        </Card>

        {/* Sélection des indicateurs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Indicators to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <IndicatorFilter
                indicators={indicators}
                selectedIds={selectedIndicators}
                onSelectionChange={setSelectedIndicators}
              />
              <p className="text-sm text-gray-600">
                {selectedIndicators.length} indicator(s) selected
              </p>
              {selectedIndicators.length < indicators.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIndicators(indicators.map((i) => i.id))}
                >
                  Select All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tableau de comparaison */}
        {filteredComparisonData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comparison Results</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRawValues(!showRawValues)}
                >
                  {showRawValues ? 'Show Normalized' : 'Show Raw Values'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonTable
                data={filteredComparisonData}
                indicators={indicators.filter((i) => selectedIndicators.includes(i.id))}
                showRawValues={showRawValues}
              />
            </CardContent>
          </Card>
        )}

        {selectedCountries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Select countries above to start comparing
            </p>
          </div>
        )}
      </main>
    </div>
  );
}