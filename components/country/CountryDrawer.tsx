// components/country/CountryDrawer.tsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatNumber, getScoreBadgeVariant } from '@/lib/utils';

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

interface CountryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  country: CountryData | null;
}

export default function CountryDrawer({
  isOpen,
  onClose,
  country,
}: CountryDrawerProps) {
  if (!country) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-2xl">{country.name}</SheetTitle>
          <div className="text-sm text-gray-500">{country.region}</div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Flag Placeholder */}
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-4xl">{country.iso3}</span>
          </div>

          {/* Global Score KPI */}
          {country.globalScore !== undefined && country.coverageRatio && country.coverageRatio >= 0.7 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Global Score</div>
              <div className="text-3xl font-bold">
                {formatNumber(country.globalScore, 1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Coverage: {formatNumber(country.coverageRatio * 100, 0)}%
              </div>
            </div>
          )}

          {/* Top 3 KPI Chips */}
          <div>
            <h3 className="text-sm font-medium mb-3">Top Indicators</h3>
            <div className="flex flex-wrap gap-2">
              {country.topIndicators.slice(0, 3).map((indicator, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-white border rounded-lg shadow-sm"
                >
                  <div className="text-xs text-gray-500">{indicator.name}</div>
                  <div className="text-lg font-semibold">
                    {formatNumber(indicator.value, 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Badges */}
          <div>
            <h3 className="text-sm font-medium mb-3">Themes Covered</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(country.topIndicators.map((i) => i.theme))
              )
                .slice(0, 5)
                .map((theme, idx) => (
                  <Badge key={idx} variant="secondary">
                    {theme}
                  </Badge>
                ))}
            </div>
          </div>

          {/* View Details Button */}
          <Link href={`/country/${country.iso3}`}>
            <Button className="w-full" onClick={onClose}>
              View Full Country Profile
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}