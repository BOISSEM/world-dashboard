// lib/scoring.ts
export interface WeightProfile {
  id: string;
  name: string;
  weights: Record<string, number>;
}

export interface IndicatorValue {
  indicatorId: string;
  valueNorm: number;
}

export interface ScoreResult {
  score: number;
  coverageRatio: number;
}

export function computeWeightedScore(
  values: IndicatorValue[],
  weights: Record<string, number>
): ScoreResult {
  let weightedSum = 0;
  let totalWeight = 0;
  let availableWeight = 0;

  const totalPossibleWeight = Object.values(weights).reduce(
    (sum, w) => sum + w,
    0
  );

  for (const value of values) {
    const weight = weights[value.indicatorId] || 0;
    weightedSum += value.valueNorm * weight;
    availableWeight += weight;
  }

  totalWeight = availableWeight;
  const coverageRatio = totalPossibleWeight > 0 
    ? totalWeight / totalPossibleWeight 
    : 0;
  
  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return {
    score: Math.max(0, Math.min(100, score)),
    coverageRatio,
  };
}

export function shouldDisplayScore(coverageRatio: number): boolean {
  return coverageRatio >= 0.7;
}