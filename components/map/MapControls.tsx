'use client';

import IndicatorFilter from './IndicatorFilter';

interface Indicator {
  id: string;
  name: string;
  theme: string;
}

interface MapControlsProps {
  indicators: Indicator[];
  selectedIndicatorIds: string[];
  onIndicatorFilterChange: (ids: string[]) => void;
}

export default function MapControls({
  indicators,
  selectedIndicatorIds,
  onIndicatorFilterChange,
}: MapControlsProps) {
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm font-medium text-gray-700">
          Customize Global Score:
        </span>
        <IndicatorFilter
          indicators={indicators}
          selectedIds={selectedIndicatorIds}
          onSelectionChange={onIndicatorFilterChange}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500">Faible</span>
        <div className="h-3 w-40 rounded-full overflow-hidden shadow-inner bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"></div>
        <span className="text-xs font-medium text-gray-500">Élevé</span>
        <span className="text-xs text-gray-400 ml-1">
          — score from {selectedIndicatorIds.length} indicator(s)
        </span>
      </div>
    </div>
  );
}