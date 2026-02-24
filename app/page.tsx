'use client';

import { useEffect, useState } from 'react';
import WorldMap from '@/components/map/WorldMap';
import MapControls from '@/components/map/MapControls';
import CountryDrawer from '@/components/country/CountryDrawer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, BookOpen, Globe2, TrendingUp } from 'lucide-react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

interface Indicator {
  id: string;
  name: string;
  theme: string;
}

interface MapDataPoint {
  iso3: string;
  name: string;
  value: number;
  coverageRatio?: number;
}

interface CountryData {
  iso3: string;
  name: string;
  region: string;
  topIndicators: Array<{
    name: string;
    value: number;
    theme: string;
  }>;
  globalScore?: number;
  coverageRatio?: number;
}

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);
  const [useGlobalScore, setUseGlobalScore] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Nouveaux états pour le filtre
  const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/indicators')
      .then((res) => res.json())
      .then((data) => {
        setIndicators(data);
        // Sélectionner tous les indicateurs par défaut
        setSelectedIndicatorIds(data.map((i: Indicator) => i.id));
        if (data.length > 0 && !useGlobalScore) {
          setSelectedIndicatorId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (useGlobalScore && selectedIndicatorIds.length > 0) {
      // Score personnalisé avec indicateurs sélectionnés
      const params = new URLSearchParams({
        year: String(new Date().getFullYear()),
        indicatorIds: selectedIndicatorIds.join(','),
      });

      fetch(`/api/custom-score?${params}`)
        .then((res) => res.json())
        .then((data) => setMapData(data));
    } else if (!useGlobalScore && selectedIndicatorId) {
      // Un seul indicateur
      const params = new URLSearchParams({
        year: String(new Date().getFullYear()),
        useGlobalScore: 'false',
        indicatorId: selectedIndicatorId,
      });

      fetch(`/api/map-data?${params}`)
        .then((res) => res.json())
        .then((data) => setMapData(data));
    }
  }, [selectedIndicatorId, useGlobalScore, selectedIndicatorIds]);

  const handleCountryClick = async (iso3: string) => {
  try {
    const res = await fetch(`/api/countries/${iso3}`);
    const data = await res.json();

    // Vérification que les données existent
    if (!data || !data.indicatorValues) {
      console.error('No indicator values for', iso3);
      return;
    }

    const topIndicators = data.indicatorValues
      .map((iv: any) => ({
        name: iv.indicator.name,
        value: iv.valueNorm,
        theme: iv.indicator.theme,
      }))
      .slice(0, 5);

    const globalScore = data.computedScores?.[0]?.score;
    const coverageRatio = data.computedScores?.[0]?.coverageRatio;

    setSelectedCountry({
      iso3: data.iso3,
      name: data.name,
      region: data.region,
      topIndicators,
      globalScore,
      coverageRatio,
    });
    setDrawerOpen(true);
  } catch (error) {
    console.error('Error fetching country data:', error);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Globe2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pays de merde</h1>
                <p className="text-sm text-gray-500">Global Indicators & Insights</p>
              </div>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Compare
                </Button>
              </Link>
              <Link href="/methodology">
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Methodology
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  Premium
                </Button>
              </Link>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Interactive World Map
            </h2>
            <p className="text-sm text-gray-600">
              Click on a country to view detailed indicators and scores
            </p>
          </div>

          <div className="p-6">
            <MapControls
              indicators={indicators}
              selectedIndicatorId={selectedIndicatorId}
              useGlobalScore={useGlobalScore}
              onIndicatorChange={(id) => {
                setSelectedIndicatorId(id);
                setUseGlobalScore(false);
              }}
              onGlobalScoreToggle={() => setUseGlobalScore(!useGlobalScore)}
              selectedIndicatorIds={selectedIndicatorIds}
              onIndicatorFilterChange={setSelectedIndicatorIds}
            />

            <div className="mt-4">
              <WorldMap
                data={mapData}
                onCountryClick={handleCountryClick}
                onCountryHover={(data) => {}}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{mapData.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Globe2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Indicators</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{indicators.length}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Year</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{new Date().getFullYear()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <CountryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        country={selectedCountry}
      />
    </div>
  );
}