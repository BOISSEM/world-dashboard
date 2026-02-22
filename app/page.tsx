'use client';

import { useEffect, useState } from 'react';
import WorldMap from '@/components/map/WorldMap';
import MapControls from '@/components/map/MapControls';
import CountryDrawer from '@/components/country/CountryDrawer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, BookOpen, Globe2, TrendingUp } from 'lucide-react';

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
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);
  const [useGlobalScore, setUseGlobalScore] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch('/api/indicators')
      .then((res) => res.json())
      .then((data) => {
        setIndicators(data);
        if (data.length > 0 && !useGlobalScore) {
          setSelectedIndicatorId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      year: '2023',
      useGlobalScore: useGlobalScore.toString(),
    });

    if (!useGlobalScore && selectedIndicatorId) {
      params.set('indicatorId', selectedIndicatorId);
    }

    fetch(`/api/map-data?${params}`)
      .then((res) => res.json())
      .then((data) => setMapData(data));
  }, [selectedIndicatorId, useGlobalScore]);

  const handleCountryClick = async (iso3: string) => {
    const res = await fetch(`/api/countries/${iso3}`);
    const data = await res.json();

    const topIndicators = data.indicatorValues
      .map((iv: any) => ({
        name: iv.indicator.name,
        value: iv.valueNorm,
        theme: iv.indicator.theme,
      }))
      .slice(0, 5);

    const globalScore = data.computedScores[0]?.score;
    const coverageRatio = data.computedScores[0]?.coverageRatio;

    setSelectedCountry({
      iso3: data.iso3,
      name: data.name,
      region: data.region,
      topIndicators,
      globalScore,
      coverageRatio,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Globe2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">World Dashboard</h1>
                <p className="text-sm text-gray-500">Global Indicators</p>
              </div>
            </div>
            <nav className="flex gap-3">
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare
                </Button>
              </Link>
              <Link href="/methodology">
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Methodology
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Interactive World Map</h2>
            <p className="text-sm text-gray-600 mt-1">Click on a country to view details</p>
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
            />

            <div className="mt-6">
              <WorldMap
                data={mapData}
                onCountryClick={handleCountryClick}
                onCountryHover={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Countries</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{mapData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Indicators</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{indicators.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Data Year</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">2023</p>
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