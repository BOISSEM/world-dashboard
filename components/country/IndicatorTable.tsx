import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';

interface IndicatorData {
  name: string;
  theme: string;
  value: number;
  valueNorm: number;
  year?: number;
  sourceName: string;
  sourceUrl: string;
}

interface IndicatorTableProps {
  indicators: IndicatorData[];
}

export default function IndicatorTable({ indicators }: IndicatorTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indicator</TableHead>
            <TableHead>Theme</TableHead>
            <TableHead className="text-right">Raw Value</TableHead>
            <TableHead className="text-right">Normalized</TableHead>
            <TableHead className="text-center">Year</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {indicators.map((ind, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{ind.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {ind.theme}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(ind.value, 2)}
              </TableCell>
              <TableCell className="text-right">
                <span className="font-semibold text-blue-600">
                  {formatNumber(ind.valueNorm, 1)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {ind.year ? (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${ind.year < 2023 ? 'bg-amber-100 text-amber-700' : 'text-gray-400'}`}>
                    {ind.year}
                  </span>
                ) : '—'}
              </TableCell>
              <TableCell>
                {ind.sourceName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}