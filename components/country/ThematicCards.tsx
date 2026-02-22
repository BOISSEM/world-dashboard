// components/country/ThematicCards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber, getScoreBadgeVariant } from '@/lib/utils';

interface IndicatorValue {
  name: string;
  value: number;
  valueNorm: number;
  theme: string;
}

interface ThematicCardsProps {
  indicators: IndicatorValue[];
}

export default function ThematicCards({ indicators }: ThematicCardsProps) {
  // Group by theme
  const grouped = indicators.reduce((acc, ind) => {
    if (!acc[ind.theme]) {
      acc[ind.theme] = [];
    }
    acc[ind.theme].push(ind);
    return acc;
  }, {} as Record<string, IndicatorValue[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {Object.entries(grouped).map(([theme, themeIndicators]) => {
        const avgScore =
          themeIndicators.reduce((sum, i) => sum + i.valueNorm, 0) /
          themeIndicators.length;

        return (
          <Card key={theme}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {theme}
                <Badge variant={getScoreBadgeVariant(avgScore)}>
                  {formatNumber(avgScore, 1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {themeIndicators.map((ind, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{ind.name}</span>
                    <span className="font-medium">
                      {formatNumber(ind.valueNorm, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}