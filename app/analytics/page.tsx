'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Globe2, BarChart3 } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import PremiumGate from '@/components/PremiumGate';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CountryScore {
  iso3: string;
  name: string;
  region: string;
  score: number;
  indicators: Record<string, number>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<CountryScore[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('freedom_score');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [plan, setPlan] = useState<'FREE' | 'PREMIUM'>('FREE');

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => setData(data));
    fetch('/api/user/plan')
      .then((r) => r.json())
      .then((d) => setPlan(d.plan));
  }, []);

  const regions = ['all', ...Array.from(new Set(data.map((d) => d.region)))];

  const filteredData = selectedRegion === 'all' 
    ? data 
    : data.filter((d) => d.region === selectedRegion);

  // Top 10 pays par score global
  const top10 = [...filteredData]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Distribution par région
  const regionData = regions
    .filter((r) => r !== 'all')
    .map((region) => {
      const regionCountries = data.filter((d) => d.region === region);
      const avgScore = regionCountries.reduce((sum, c) => sum + c.score, 0) / regionCountries.length;
      return {
        region,
        avgScore: Math.round(avgScore * 10) / 10,
        count: regionCountries.length,
      };
    });

  // Scatter plot: GDP vs Life Expectancy
  const scatterData = filteredData.map((country) => ({
    name: country.name,
    gdp: country.indicators.gdp_per_capita || 0,
    lifeExpectancy: country.indicators.life_expectancy || 0,
    score: country.score,
  }));

  // Comparaison indicateurs pour top 20
  const top20 = [...filteredData]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const COLORS = {
    Europe: '#3b82f6',
    Asia: '#ef4444',
    Americas: '#10b981',
    Africa: '#f59e0b',
    Oceania: '#8b5cf6',
  };

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
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-500">Interactive data visualizations</p>
                </div>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filter by Region
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region === 'all' ? 'All Regions' : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Countries</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredData.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(filteredData.reduce((sum, c) => sum + c.score, 0) / filteredData.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Pays */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top 10 Countries by Global Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                  {top10.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.region as keyof typeof COLORS] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution par région */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-green-600" />
              Average Score by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="avgScore" fill="#10b981" radius={[8, 8, 0, 0]} name="Average Score">
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.region as keyof typeof COLORS] || '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter: GDP vs Life Expectancy — Premium */}
        <PremiumGate
          plan={plan}
          title="Graphique Premium"
          description="Accédez au scatter plot GDP vs Espérance de vie et bien plus avec le plan Premium."
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>GDP per Capita vs Life Expectancy</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Bubble size represents global score
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="gdp"
                    name="GDP per Capita"
                    label={{ value: 'GDP per Capita ($)', position: 'bottom' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="lifeExpectancy"
                    name="Life Expectancy"
                    label={{ value: 'Life Expectancy (years)', angle: -90, position: 'left' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'gdp') return [`$${value.toLocaleString()}`, 'GDP per Capita'];
                      if (name === 'lifeExpectancy') return [`${value} years`, 'Life Expectancy'];
                      if (name === 'score') return [`${value}`, 'Global Score'];
                      return value;
                    }}
                  />
                  <Scatter name="Countries" data={scatterData} fill="#8b5cf6">
                    {scatterData.map((entry, index) => {
                      const country = filteredData.find(c => c.name === entry.name);
                      const color = country ? COLORS[country.region as keyof typeof COLORS] || '#8b5cf6' : '#8b5cf6';
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={color}
                          opacity={0.6}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </PremiumGate>

        {/* Evolution comparative — Premium */}
        <PremiumGate
          plan={plan}
          title="Comparaison d'indicateurs Premium"
          description="Comparez les 20 meilleurs pays sur plusieurs indicateurs simultanément."
        >
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Countries - Indicator Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={top20}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Global Score"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={(d) => d.indicators.freedom_score}
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Freedom"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={(d) => d.indicators.gdp_per_capita}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="GDP"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </PremiumGate>
      </main>
    </div>
  );
}