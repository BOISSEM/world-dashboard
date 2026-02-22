'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Indicator {
  id: string;
  name: string;
  theme: string;
}

interface MapControlsProps {
  indicators: Indicator[];
  selectedIndicatorId: string | null;
  useGlobalScore: boolean;
  onIndicatorChange: (id: string | null) => void;
  onGlobalScoreToggle: () => void;
}

export default function MapControls({
  indicators,
  selectedIndicatorId,
  useGlobalScore,
  onIndicatorChange,
  onGlobalScoreToggle,
}: MapControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Color by:
        </span>
        <Select
          value={useGlobalScore ? 'global' : selectedIndicatorId || ''}
          onValueChange={(value) => {
            if (value === 'global') {
              onGlobalScoreToggle();
            } else {
              onIndicatorChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[280px] bg-white border-gray-300">
            <SelectValue placeholder="Select indicator" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="global">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌐</span>
                <span className="font-semibold">Global Score</span>
              </div>
            </SelectItem>
            {indicators.map((indicator) => (
              <SelectItem key={indicator.id} value={indicator.id}>
                <div className="flex items-center justify-between gap-4">
                  <span>{indicator.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {indicator.theme}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500">Low</span>
        <div className="h-3 w-40 rounded-full overflow-hidden shadow-inner bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"></div>
        <span className="text-xs font-medium text-gray-500">High</span>
      </div>
    </div>
  );
}