// components/compare/ComparisonTable.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ComparisonData {
  country: string;
  globalScore?: number;
  indicators: Record<string, { value: number; valueNorm: number }>;
}

interface ComparisonTableProps {
  data: ComparisonData[];
  showNormalized: boolean;
  indicatorNames: Record<string, string>;
}

export default function ComparisonTable({
  data,
  showNormalized,
  indicatorNames,
}: ComparisonTableProps) {
  if (data.length === 0) return null;

  const allIndicators = Array.from(
    new Set(data.flatMap((d) => Object.keys(d.indicators)))
  );

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Global Score</TableHead>
            {allIndicators.map((indId) => (
              <TableHead key={indId} className="text-right">
                {indicatorNames[indId] || indId}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{row.country}</TableCell>
              <TableCell className="text-right">
                {row.globalScore !== undefined ? (
                  <Badge variant="secondary">
                    {formatNumber(row.globalScore, 1)}
                  </Badge>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </TableCell>
              {allIndicators.map((indId) => {
                const indData = row.indicators[indId];
                if (!indData) {
                  return (
                    <TableCell key={indId} className="text-right text-gray-400">
                      N/A
                    </TableCell>
                  );
                }
                const displayValue = showNormalized
                  ? indData.valueNorm
                  : indData.value;
                return (
                  <TableCell key={indId} className="text-right">
                    {formatNumber(displayValue, 2)}
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