// components/compare/CompareSelector.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Country {
  iso3: string;
  name: string;
}

interface CompareSelectorProps {
  countries: Country[];
  selectedCountries: string[];
  onSelectionChange: (selected: string[]) => void;
}

export default function CompareSelector({
  countries,
  selectedCountries,
  onSelectionChange,
}: CompareSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedCountries.includes(c.iso3)
  );

  const handleAdd = (iso3: string) => {
    if (selectedCountries.length < 5) {
      onSelectionChange([...selectedCountries, iso3]);
      setSearchTerm('');
    }
  };

  const handleRemove = (iso3: string) => {
    onSelectionChange(selectedCountries.filter((c) => c !== iso3));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Select Countries (max 5)
        </label>
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
        {searchTerm && filteredCountries.length > 0 && (
          <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
            {filteredCountries.slice(0, 10).map((country) => (
              <button
                key={country.iso3}
                onClick={() => handleAdd(country.iso3)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100"
              >
                {country.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedCountries.map((iso3) => {
          const country = countries.find((c) => c.iso3 === iso3);
          return (
            <Badge key={iso3} variant="secondary" className="px-3 py-1">
              {country?.name}
              <button
                onClick={() => handleRemove(iso3)}
                className="ml-2 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}