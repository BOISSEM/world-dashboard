'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ComparisonData {
  country: {
    iso3: string;
    name: string;
    region: string;
  };
  indicators: Record<string, { value: number; valueNorm: number }>;
  globalScore?: number;
}

interface Indicator {
  id: string;
  name: string;
  theme: string;
}

interface ComparisonTableProps {
  data: ComparisonData[];
  indicators: Indicator[];
  showRawValues: boolean;
}

export default function ComparisonTable({
  data,
  indicators,
  showRawValues,
}: ComparisonTableProps) {
  const getColorClass = (value: number) => {
    if (value >= 75) return 'bg-green-100 text-green-800';
    if (value >= 50) return 'bg-yellow-100 text-yellow-800';
    if (value >= 25) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <>
      {/* ── Mobile : une carte par indicateur ── */}
      <div className="block sm:hidden space-y-3">
        {data[0]?.globalScore !== undefined && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Global Score</p>
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.country.iso3} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{item.country.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{item.country.region}</span>
                  </div>
                  {item.globalScore !== undefined && (
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getColorClass(item.globalScore)}`}>
                      {item.globalScore.toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {indicators.map((indicator) => (
          <div key={indicator.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-800">{indicator.name}</span>
              <Badge variant="outline" className="text-xs shrink-0">{indicator.theme}</Badge>
            </div>
            <div className="space-y-2">
              {data.map((item) => {
                const d = item.indicators[indicator.id];
                return (
                  <div key={item.country.iso3} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.country.name}</span>
                    {d ? (
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${showRawValues ? 'bg-gray-100 text-gray-800' : getColorClass(d.valueNorm)}`}>
                        {showRawValues ? d.value.toFixed(2) : d.valueNorm.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop : tableau classique ── */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
                Country
              </TableHead>
              {data[0]?.globalScore !== undefined && (
                <TableHead className="text-center font-bold">Global Score</TableHead>
              )}
              {indicators.map((indicator) => (
                <TableHead key={indicator.id} className="text-center min-w-[150px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">{indicator.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {indicator.theme}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.country.iso3}>
                <TableCell className="sticky left-0 bg-white z-10 font-medium">
                  <div>
                    <div className="font-semibold">{item.country.name}</div>
                    <div className="text-xs text-gray-500">{item.country.region}</div>
                  </div>
                </TableCell>
                {item.globalScore !== undefined && (
                  <TableCell className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full font-bold ${getColorClass(item.globalScore)}`}>
                      {item.globalScore.toFixed(1)}
                    </div>
                  </TableCell>
                )}
                {indicators.map((indicator) => {
                  const indicatorData = item.indicators[indicator.id];
                  if (!indicatorData) {
                    return (
                      <TableCell key={indicator.id} className="text-center text-gray-400">
                        N/A
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={indicator.id} className="text-center">
                      <div className={`inline-block px-3 py-1 rounded ${showRawValues ? 'bg-gray-100' : getColorClass(indicatorData.valueNorm)}`}>
                        {showRawValues ? indicatorData.value.toFixed(2) : indicatorData.valueNorm.toFixed(1)}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}