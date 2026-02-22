'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoPath, geoMercator } from 'd3-geo';
import { scaleLinear } from 'd3-scale';

// Table de correspondance pour les codes ISO3 non-standard
const ISO3_MAPPING: Record<string, string> = {
  'FRA': 'FRA',
  'NOR': 'NOR',
  'GRL': 'DNK',
  'SJM': 'NOR',
  'ALA': 'FIN',
  'FLK': 'GBR',
  'GGY': 'GBR',
  'JEY': 'GBR',
  'IMN': 'GBR',
  'GIB': 'GBR',
  'BVT': 'NOR',
  'HMD': 'AUS',
  'CCK': 'AUS',
  'CXR': 'AUS',
  'NFK': 'AUS',
  'ESH': 'MAR',
  'ATF': 'FRA',
  'IOT': 'GBR',
  'BES': 'NLD',
  'CUW': 'NLD',
  'SXM': 'NLD',
  'ABW': 'NLD',
  'PRI': 'USA',
  'VIR': 'USA',
  'GUM': 'USA',
  'ASM': 'USA',
  'MNP': 'USA',
  'UMI': 'USA',
  'NCL': 'FRA',
  'PYF': 'FRA',
  'WLF': 'FRA',
  'SPM': 'FRA',
  'MAF': 'FRA',
  'BLM': 'FRA',
  'REU': 'FRA',
  'MYT': 'FRA',
  'GLP': 'FRA',
  'MTQ': 'FRA',
  'GUF': 'FRA',
  'BMU': 'GBR',
  'VGB': 'GBR',
  'CYM': 'GBR',
  'TCA': 'GBR',
  'MSR': 'GBR',
  'AIA': 'GBR',
  'SHN': 'GBR',
  'SGS': 'GBR',
  'PCN': 'GBR',
};

// Table de correspondance par nom (fallback)
const NAME_TO_ISO3: Record<string, string> = {
  'France': 'FRA',
  'Norway': 'NOR',
  'Greenland': 'DNK',
  'Svalbard and Jan Mayen': 'NOR',
  'French Southern Territories': 'FRA',
};

// Fonction pour obtenir l'ISO3 avec mapping
function getISO3(properties: any): string | null {
  // Essayer d'abord les propriétés standards
  let iso3 = properties['ISO3166-1-Alpha-3'] || 
             properties.ISO_A3 || 
             properties.iso_a3 ||
             properties.ADM0_A3 ||
             properties.SOV_A3;
  
  // Si c'est -99 ou invalide, essayer le mapping par code
  if (!iso3 || iso3 === '-99') {
    const code = properties.ISO_A3 || properties.ADM0_A3;
    if (code && ISO3_MAPPING[code]) {
      return ISO3_MAPPING[code];
    }
  }
  
  // Essayer le mapping direct
  if (iso3 && ISO3_MAPPING[iso3]) {
    return ISO3_MAPPING[iso3];
  }
  
  // Fallback sur le nom
  const name = properties.name || properties.NAME || properties.ADMIN;
  if (name && NAME_TO_ISO3[name] !== undefined) {
    return NAME_TO_ISO3[name];
  }
  
  // Si c'est -99, retourner null
  if (iso3 === '-99') {
    return null;
  }
  
  return iso3;
}

interface MapDataPoint {
  iso3: string;
  name: string;
  value: number;
  coverageRatio?: number;
}

interface WorldMapProps {
  data: MapDataPoint[];
  onCountryClick: (iso3: string) => void;
  onCountryHover: (data: MapDataPoint | null) => void;
}

export default function WorldMap({
  data,
  onCountryClick,
  onCountryHover,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldGeo, setWorldGeo] = useState<any>(null);
  const [tooltipData, setTooltipData] = useState<{
    data: MapDataPoint;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch('/geo/countries.geojson')
      .then((response) => response.json())
      .then((data) => {
        setWorldGeo(data);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de la carte:', error);
      });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !worldGeo) return;

    const svg = d3.select(svgRef.current);
    const width = 960;
    const height = 500;

    svg.selectAll('*').remove();

    const projection = geoMercator()
      .scale(130)
      .translate([width / 2, height / 1.5]);

    const path = geoPath().projection(projection);

    const dataMap = new Map(data.map((d) => [d.iso3, d]));

    const colorScale = scaleLinear<string>()
      .domain([0, 30, 50, 70, 100])
      .range(['#ef4444', '#f97316', '#fbbf24', '#84cc16', '#22c55e']);

    const g = svg.append('g');

    // Dessiner les pays
    g.selectAll('path')
      .data(worldGeo.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        const iso3 = getISO3(d.properties);
        
        if (!iso3) return '#e0e0e0';
        
        const countryData = dataMap.get(iso3);
        if (countryData) {
          return colorScale(countryData.value);
        }
        return '#e0e0e0';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', (d: any) => {
        const iso3 = getISO3(d.properties);
        if (!iso3) return 'default';
        return dataMap.has(iso3) ? 'pointer' : 'default';
      })
      .on('click', (event: any, d: any) => {
        const iso3 = getISO3(d.properties);
        
        console.log('Pays cliqué:', d.properties.name || d.properties.NAME, 'ISO3:', iso3);
        
        if (!iso3) {
          console.log('❌ Territoire sans données');
          return;
        }
        
        if (dataMap.has(iso3)) {
          console.log('✅ Pays trouvé! Ouverture du panneau...');
          onCountryClick(iso3);
        } else {
          console.log('❌ Pays non trouvé dans la base. ISO3:', iso3);
        }
      })
      .on('mouseenter', (event: any, d: any) => {
        const iso3 = getISO3(d.properties);
        
        if (!iso3) return;
        
        const countryData = dataMap.get(iso3);
        if (countryData) {
          onCountryHover(countryData);
          const [x, y] = d3.pointer(event);
          setTooltipData({ data: countryData, x, y });
        }
      })
      .on('mouseleave', () => {
        onCountryHover(null);
        setTooltipData(null);
      });

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);
  }, [worldGeo, data, onCountryClick, onCountryHover]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="960"
        height="500"
        className="w-full h-auto border-0 rounded-lg bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 shadow-inner"
        style={{ maxHeight: '500px' }}
      />
      {tooltipData && (
        <div
          className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 px-4 py-3 pointer-events-none z-50"
          style={{
            left: Math.min(tooltipData.x + 15, 900),
            top: tooltipData.y - 60,
          }}
        >
          <div className="font-bold text-gray-900 text-base mb-1">
            {tooltipData.data.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Score:</span>
            <span className="font-bold text-lg text-blue-600">
              {tooltipData.data.value.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}