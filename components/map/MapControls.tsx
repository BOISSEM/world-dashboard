'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import IndicatorFilter from './IndicatorFilter';

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
  selectedIndicatorIds?: string[];
  onIndicatorFilterChange?: (ids: string[]) => void;
}

export default function MapControls({
  indicators,
  selectedIndicatorId,
  useGlobalScore,
  onIndicatorChange,
  onGlobalScoreToggle,
  selectedIndicatorIds = [],
  onIndicatorFilterChange,
}: MapControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Colorier par :
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
            <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 max-h-[400px] overflow-y-auto">
              <SelectItem value="global" className="bg-white hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌐</span>
                  <span className="font-semibold">Score Global</span>
                </div>
              </SelectItem>
              {indicators.map((indicator) => (
                <SelectItem 
                  key={indicator.id} 
                  value={indicator.id}
                  className="bg-white hover:bg-gray-100"
                >
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span>{indicator.name}</span>
                    <Badge variant="outline" className="text-xs bg-white">
                      {indicator.theme}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Faible</span>
          <div className="h-3 w-40 rounded-full overflow-hidden shadow-inner bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"></div>
          <span className="text-xs font-medium text-gray-500">Élevé</span>
        </div>
      </div>

      {/* Filtre multi-critères */}
      {useGlobalScore && onIndicatorFilterChange && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-gray-700">
              Customize Global Score:
            </span>
            <IndicatorFilter
              indicators={indicators}
              selectedIds={selectedIndicatorIds}
              onSelectionChange={onIndicatorFilterChange}
            />
          </div>
          {selectedIndicatorIds.length > 0 && (
            <p className="text-xs text-gray-600">
              Global score calculated from {selectedIndicatorIds.length} selected indicator(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
}