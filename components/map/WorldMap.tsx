'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoPath, geoMercator } from 'd3-geo';
import { scaleLinear } from 'd3-scale';

const ISO3_MAPPING: Record<string, string> = {
  'FRA': 'FRA', 'NOR': 'NOR', 'GRL': 'DNK', 'SJM': 'NOR', 'ALA': 'FIN',
  'FLK': 'GBR', 'GGY': 'GBR', 'JEY': 'GBR', 'IMN': 'GBR', 'GIB': 'GBR',
  'BVT': 'NOR', 'HMD': 'AUS', 'CCK': 'AUS', 'CXR': 'AUS', 'NFK': 'AUS',
  'ESH': 'MAR', 'ATF': 'FRA', 'IOT': 'GBR', 'BES': 'NLD', 'CUW': 'NLD',
  'SXM': 'NLD', 'ABW': 'NLD', 'PRI': 'USA', 'VIR': 'USA', 'GUM': 'USA',
  'ASM': 'USA', 'MNP': 'USA', 'UMI': 'USA', 'NCL': 'FRA', 'PYF': 'FRA',
  'WLF': 'FRA', 'SPM': 'FRA', 'MAF': 'FRA', 'BLM': 'FRA', 'REU': 'FRA',
  'MYT': 'FRA', 'GLP': 'FRA', 'MTQ': 'FRA', 'GUF': 'FRA', 'BMU': 'GBR',
  'VGB': 'GBR', 'CYM': 'GBR', 'TCA': 'GBR', 'MSR': 'GBR', 'AIA': 'GBR',
  'SHN': 'GBR', 'SGS': 'GBR', 'PCN': 'GBR',
};

const NAME_TO_ISO3: Record<string, string> = {
  'France': 'FRA', 'Norway': 'NOR', 'Greenland': 'DNK',
  'Svalbard and Jan Mayen': 'NOR', 'French Southern Territories': 'FRA',
};

function getISO3(properties: any): string | null {
  let iso3 = properties['ISO3166-1-Alpha-3'] || properties.ISO_A3 ||
             properties.iso_a3 || properties.ADM0_A3 || properties.SOV_A3;
  if (!iso3 || iso3 === '-99') {
    const code = properties.ISO_A3 || properties.ADM0_A3;
    if (code && ISO3_MAPPING[code]) return ISO3_MAPPING[code];
  }
  if (iso3 && ISO3_MAPPING[iso3]) return ISO3_MAPPING[iso3];
  const name = properties.name || properties.NAME || properties.ADMIN;
  if (name && NAME_TO_ISO3[name]) return NAME_TO_ISO3[name];
  if (iso3 === '-99') return null;
  return iso3;
}

const colorScale = scaleLinear<string>()
  .domain([0, 30, 50, 70, 100])
  .range(['#ef4444', '#f97316', '#fbbf24', '#84cc16', '#22c55e']);

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

export default function WorldMap({ data, onCountryClick, onCountryHover }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldGeo, setWorldGeo] = useState<any>(null);
  const [tooltipData, setTooltipData] = useState<{ data: MapDataPoint; x: number; y: number } | null>(null);

  // Keep callbacks in a ref to avoid stale closures in D3 event handlers
  const callbackRef = useRef({ onCountryClick, onCountryHover });
  useEffect(() => { callbackRef.current = { onCountryClick, onCountryHover }; }, [onCountryClick, onCountryHover]);

  // Load GeoJSON once
  useEffect(() => {
    fetch('/geo/countries.geojson')
      .then((r) => r.json())
      .then(setWorldGeo)
      .catch((e) => console.error('Map load error:', e));
  }, []);

  // Draw SVG paths once when GeoJSON is ready
  useEffect(() => {
    if (!svgRef.current || !worldGeo) return;

    const svg = d3.select(svgRef.current);
    const width = 960;
    const height = 500;

    svg.selectAll('*').remove();

    const projection = geoMercator().scale(130).translate([width / 2, height / 1.5]);
    const path = geoPath().projection(projection);
    const g = svg.append('g').attr('class', 'map-g');

    g.selectAll('path')
      .data(worldGeo.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', '#e0e0e0')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('click', (_event: any, d: any) => {
        const iso3 = getISO3(d.properties);
        if (iso3) callbackRef.current.onCountryClick(iso3);
      })
      .on('mouseenter', (event: any, d: any) => {
        const iso3 = getISO3(d.properties);
        if (!iso3) return;
        const [x, y] = d3.pointer(event);
        // Will be populated by the color effect's dataMap via data attribute
        const name = d.properties.name || d.properties.NAME || iso3;
        const valueStr = (event.target as SVGPathElement).getAttribute('data-value');
        if (valueStr) {
          const value = parseFloat(valueStr);
          const point = { iso3, name, value };
          callbackRef.current.onCountryHover(point);
          setTooltipData({ data: point, x, y });
        }
      })
      .on('mouseleave', () => {
        callbackRef.current.onCountryHover(null);
        setTooltipData(null);
      });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom as any);
  }, [worldGeo]);

  // Update colors only when data changes — fast, no DOM rebuilding
  useEffect(() => {
    if (!svgRef.current || !worldGeo) return;
    const dataMap = new Map(data.map((d) => [d.iso3, d]));

    d3.select(svgRef.current)
      .select('g.map-g')
      .selectAll<SVGPathElement, any>('path')
      .attr('fill', (d: any) => {
        const iso3 = getISO3(d.properties);
        if (!iso3) return '#e0e0e0';
        const point = dataMap.get(iso3);
        return point ? colorScale(point.value) : '#e0e0e0';
      })
      .attr('data-value', (d: any) => {
        const iso3 = getISO3(d.properties);
        if (!iso3) return null;
        return dataMap.get(iso3)?.value ?? null;
      })
      .style('cursor', (d: any) => {
        const iso3 = getISO3(d.properties);
        return iso3 && dataMap.has(iso3) ? 'pointer' : 'default';
      });
  }, [data, worldGeo]);

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 960 500"
        className="w-full h-auto rounded-lg bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 shadow-inner"
      />
      {tooltipData && (
        <div
          className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 px-4 py-3 pointer-events-none z-50"
          style={{
            left: Math.min(tooltipData.x + 15, 860),
            top: Math.max(tooltipData.y - 60, 10),
          }}
        >
          <div className="font-bold text-gray-900 text-base mb-1">{tooltipData.data.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Score:</span>
            <span className="font-bold text-lg text-blue-600">{tooltipData.data.value.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
