import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MethodologyPage() {
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
          <h1 className="text-3xl font-bold">Methodology</h1>
          <p className="text-gray-600">
            Understanding our data sources and scoring methodology
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Normalization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Overview</h3>
              <p className="text-gray-700">
                To enable cross-indicator comparison, all raw indicator values
                are normalized to a 0-100 scale.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Global Score Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Weighted Average</h3>
              <p className="text-gray-700 mb-2">
                The global score is computed as a weighted average of available
                normalized indicators.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-1">Data Coverage</h3>
              <p className="text-gray-700 text-sm">
                Not all indicators are available for all countries. Missing
                data is clearly marked and affects global score calculation.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}