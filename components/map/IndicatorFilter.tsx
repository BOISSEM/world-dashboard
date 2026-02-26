'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  theme: string;
}

interface IndicatorFilterProps {
  indicators: Indicator[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function IndicatorFilter({
  indicators,
  selectedIds,
  onSelectionChange,
}: IndicatorFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Grouper par thème
  const themes = Array.from(new Set(indicators.map((i) => i.theme)));
  const groupedIndicators = themes.reduce((acc, theme) => {
    acc[theme] = indicators.filter((i) => i.theme === theme);
    return acc;
  }, {} as Record<string, Indicator[]>);

  const toggleIndicator = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange(indicators.map((i) => i.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectTheme = (theme: string) => {
    const themeIds = groupedIndicators[theme].map((i) => i.id);
    const allSelected = themeIds.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      // Deselect theme
      onSelectionChange(selectedIds.filter((id) => !themeIds.includes(id)));
    } else {
      // Select theme
      const newIds = [...new Set([...selectedIds, ...themeIds])];
      onSelectionChange(newIds);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="w-4 h-4" />
        Filter Indicators ({selectedIds.length}/{indicators.length})
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <Card className="fixed sm:absolute inset-x-4 sm:inset-auto top-[8vh] sm:top-12 sm:left-0 w-auto sm:w-[600px] max-h-[80vh] sm:max-h-[600px] overflow-auto z-50 shadow-2xl bg-white border border-gray-200">
            <CardHeader className="sticky top-0 bg-white border-b z-10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Select Indicators</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={selectAll}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {themes.map((theme) => {
                const themeIndicators = groupedIndicators[theme];
                const allSelected = themeIndicators.every((i) =>
                  selectedIds.includes(i.id)
                );

                return (
                  <div key={theme} className="mb-6">
                    <div
                      className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => selectTheme(theme)}
                    >
                      <Checkbox checked={allSelected} />
                      <Badge variant="secondary">{theme}</Badge>
                      <span className="text-sm text-gray-500">
                        ({themeIndicators.length} indicators)
                      </span>
                    </div>

                    <div className="ml-8 space-y-2">
                      {themeIndicators.map((indicator) => (
                        <div
                          key={indicator.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          onClick={() => toggleIndicator(indicator.id)}
                        >
                          <Checkbox
                            checked={selectedIds.includes(indicator.id)}
                          />
                          <span className="text-sm">{indicator.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}