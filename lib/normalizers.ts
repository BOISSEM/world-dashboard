// lib/normalizers.ts
export interface Indicator {
  id: string;
  name: string;
  theme: string;
  scaleMin: number;
  scaleMax: number;
  higherIsBetter: boolean;
  sourceName: string;
  sourceUrl: string;
}

export function normalizeValue(
  value: number,
  indicator: Indicator
): number {
  let normalized: number;

  if (indicator.id === 'freedom_score') {
    // Already 0-100
    normalized = value;
  } else if (indicator.id.startsWith('wgi_')) {
    // WGI indicators: -2.5 to +2.5 → 0 to 100
    normalized = ((value + 2.5) / 5.0) * 100;
  } else {
    // Linear normalization
    const range = indicator.scaleMax - indicator.scaleMin;
    normalized = ((value - indicator.scaleMin) / range) * 100;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, normalized));
}

export function denormalizeValue(
  normalizedValue: number,
  indicator: Indicator
): number {
  if (indicator.id === 'freedom_score') {
    return normalizedValue;
  } else if (indicator.id.startsWith('wgi_')) {
    return (normalizedValue / 100) * 5.0 - 2.5;
  } else {
    const range = indicator.scaleMax - indicator.scaleMin;
    return (normalizedValue / 100) * range + indicator.scaleMin;
  }
}