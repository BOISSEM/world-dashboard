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
    <div className="overflow-x-auto">
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
                  <div
                    className={`inline-block px-3 py-1 rounded-full font-bold ${getColorClass(
                      item.globalScore
                    )}`}
                  >
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

                const displayValue = showRawValues
                  ? indicatorData.value.toFixed(2)
                  : indicatorData.valueNorm.toFixed(1);

                return (
                  <TableCell key={indicator.id} className="text-center">
                    <div
                      className={`inline-block px-3 py-1 rounded ${
                        showRawValues ? 'bg-gray-100' : getColorClass(indicatorData.valueNorm)
                      }`}
                    >
                      {displayValue}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}