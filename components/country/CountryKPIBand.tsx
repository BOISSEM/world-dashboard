// components/country/CountryKPIBand.tsx
'use client';

import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface KPI {
  label: string;
  value: number;
  unit?: string;
}

interface CountryKPIBandProps {
  kpis: KPI[];
}

export default function CountryKPIBand({ kpis }: CountryKPIBandProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="p-6">
          <div className="text-sm text-gray-500 mb-2">{kpi.label}</div>
          <div className="text-3xl font-bold">
            {formatNumber(kpi.value, 1)}
            {kpi.unit && <span className="text-lg ml-1">{kpi.unit}</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}