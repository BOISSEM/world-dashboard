/**
 * Imports 4 key indicators with verified sources:
 *   - co2_emissions      : Our World in Data / GCP (metric tons per capita)
 *   - homicide_rate      : World Bank VC.IHR.PSRC.P5 (per 100,000 people)
 *   - freedom_score      : World Bank WGI VA.EST (Voice & Accountability, -2.5 → 2.5)
 *   - happiness_index    : Our World in Data / World Happiness Report (Cantril ladder, 0–10)
 *
 * Strategy:
 *   - Historical years 2015–2023 stored with their actual year.
 *   - Most recent available value per country also stored as year=2024
 *     so the "current view" always has data.
 *
 * Run with: npx tsx scripts/import-missing-indicators.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LATEST_YEAR = 2024;
const TOTAL_INDICATORS = 24; // 20 existing + 4 new

// ---------------------------------------------------------------------------
// Indicator definitions
// ---------------------------------------------------------------------------
const CO2_INDICATOR = {
  id: 'co2_emissions',
  name: 'CO2 Emissions per Capita',
  theme: 'Environment',
  sourceName: 'Our World in Data / GCP',
  sourceUrl: 'https://ourworldindata.org/co2-emissions',
  scaleMin: 0, scaleMax: 25, higherIsBetter: false,
} as const;

const WB_INDICATORS = [
  {
    id: 'homicide_rate',
    name: 'Homicide Rate',
    theme: 'Security',
    sourceName: 'UNODC / World Bank',
    sourceUrl: 'https://data.worldbank.org/indicator/VC.IHR.PSRC.P5',
    wbCode: 'VC.IHR.PSRC.P5',
    scaleMin: 0, scaleMax: 30, higherIsBetter: false,
  },
  {
    id: 'freedom_score',
    name: 'Freedom & Democracy',
    theme: 'Democracy & Rights',
    sourceName: 'World Bank WGI',
    sourceUrl: 'https://info.worldbank.org/governance/wgi/',
    wbCode: 'VA.EST',
    scaleMin: -2.5, scaleMax: 2.5, higherIsBetter: true,
  },
] as const;

const HAPPINESS_INDICATOR = {
  id: 'happiness_index',
  name: 'Happiness Index',
  theme: 'Wellbeing',
  sourceName: 'World Happiness Report (OWID)',
  sourceUrl: 'https://worldhappiness.report/',
  scaleMin: 2, scaleMax: 8, higherIsBetter: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalize(value: number, scaleMin: number, scaleMax: number, higherIsBetter: boolean): number {
  let n = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
  if (!higherIsBetter) n = 100 - n;
  return Math.max(0, Math.min(100, n));
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

interface RawPoint { iso3: string; year: number; value: number; }

// ---------------------------------------------------------------------------
// World Bank fetch (range)
// ---------------------------------------------------------------------------
async function fetchWBRange(code: string, yearFrom: number, yearTo: number, attempt = 1): Promise<RawPoint[]> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&date=${yearFrom}:${yearTo}&per_page=10000`;
  try {
    const res  = await fetch(url);
    const text = await res.text();
    if (text.trimStart().startsWith('<')) throw new Error('HTML response');
    const data = JSON.parse(text);
    if (!data[1] || data[1].length === 0) return [];
    return (data[1] as any[])
      .filter(r => r.value !== null && r.countryiso3code)
      .map(r => ({ iso3: r.countryiso3code, year: parseInt(r.date), value: parseFloat(r.value) }));
  } catch {
    if (attempt >= 4) { console.warn(`    ❌ Failed after ${attempt} attempts`); return []; }
    const wait = attempt * 5000;
    process.stdout.write(` (retry ${attempt} in ${wait/1000}s)...`);
    await sleep(wait);
    return fetchWBRange(code, yearFrom, yearTo, attempt + 1);
  }
}

// World Bank MRV=1: most recent value, returned as year=LATEST_YEAR
async function fetchWBMRV(code: string): Promise<RawPoint[]> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&MRV=1&per_page=1000`;
  try {
    const res  = await fetch(url);
    const text = await res.text();
    if (text.trimStart().startsWith('<')) throw new Error('HTML response');
    const data = JSON.parse(text);
    if (!data[1] || data[1].length === 0) return [];
    return (data[1] as any[])
      .filter(r => r.value !== null && r.countryiso3code)
      .map(r => ({ iso3: r.countryiso3code, year: LATEST_YEAR, value: parseFloat(r.value) }));
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Our World in Data — CO2 emissions per capita (GCP dataset)
// ---------------------------------------------------------------------------
async function fetchCO2(): Promise<RawPoint[]> {
  const url = 'https://ourworldindata.org/grapher/co-emissions-per-capita.csv';
  const res  = await fetch(url);
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);
  const header = lines[0].split(',');
  const col = header.findIndex(h => h.trim().startsWith('CO') && h.includes('emissions per capita'));

  const rows: RawPoint[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const iso3  = cols[1]?.trim();
    const year  = parseInt(cols[2]);
    const value = col >= 0 ? parseFloat(cols[col]) : NaN;
    if (!iso3 || iso3.startsWith('OWID') || isNaN(year) || isNaN(value)) continue;
    if (year >= 2015 && year <= 2023) rows.push({ iso3, year, value });
  }

  // Most recent value per country → stored as LATEST_YEAR
  const latest = new Map<string, RawPoint>();
  for (const r of rows) {
    const cur = latest.get(r.iso3);
    if (!cur || r.year > cur.year) latest.set(r.iso3, r);
  }
  const currentYear = Array.from(latest.values()).map(r => ({ ...r, year: LATEST_YEAR }));

  return [...rows, ...currentYear];
}

// ---------------------------------------------------------------------------
// Our World in Data — Happiness
// ---------------------------------------------------------------------------
async function fetchHappiness(): Promise<RawPoint[]> {
  const url = 'https://ourworldindata.org/grapher/happiness-cantril-ladder.csv';
  const res  = await fetch(url);
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);
  const header = lines[0].split(',');
  const scoreCol = header.length - 1; // last column is the score

  const rows: RawPoint[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const iso3  = cols[1]?.trim();
    const year  = parseInt(cols[2]);
    const value = parseFloat(cols[scoreCol]);
    if (!iso3 || iso3.startsWith('OWID') || isNaN(year) || isNaN(value)) continue;
    rows.push({ iso3, year, value });
  }

  // For year=LATEST_YEAR: take the most recent entry per country
  const latest = new Map<string, RawPoint>();
  for (const r of rows) {
    const cur = latest.get(r.iso3);
    if (!cur || r.year > cur.year) latest.set(r.iso3, r);
  }
  const currentYear: RawPoint[] = Array.from(latest.values()).map(r => ({ ...r, year: LATEST_YEAR }));

  return [...rows, ...currentYear];
}

// ---------------------------------------------------------------------------
// Upsert helper
// ---------------------------------------------------------------------------
async function upsertValues(
  indicatorId: string,
  points: RawPoint[],
  scaleMin: number,
  scaleMax: number,
  higherIsBetter: boolean,
  knownISO3: Set<string>,
) {
  const filtered = points.filter(p => knownISO3.has(p.iso3));
  let done = 0;
  for (const p of filtered) {
    const valueNorm = normalize(p.value, scaleMin, scaleMax, higherIsBetter);
    await prisma.countryIndicatorValue.upsert({
      where: { iso3_indicatorId_year: { iso3: p.iso3, indicatorId, year: p.year } },
      update:  { value: p.value, valueNorm },
      create:  { iso3: p.iso3, indicatorId, year: p.year, value: p.value, valueNorm },
    });
    done++;
  }
  return done;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n🌍 Importing 4 missing indicators...\n');

  const countries  = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3  = new Set(countries.map(c => c.iso3));

  // ── 1. CO2 (OWID) ────────────────────────────────────────────────────────
  await prisma.indicator.upsert({
    where:  { id: CO2_INDICATOR.id },
    update: { name: CO2_INDICATOR.name, theme: CO2_INDICATOR.theme, sourceName: CO2_INDICATOR.sourceName, sourceUrl: CO2_INDICATOR.sourceUrl, scaleMin: CO2_INDICATOR.scaleMin, scaleMax: CO2_INDICATOR.scaleMax, higherIsBetter: CO2_INDICATOR.higherIsBetter },
    create: { id: CO2_INDICATOR.id, name: CO2_INDICATOR.name, theme: CO2_INDICATOR.theme, sourceName: CO2_INDICATOR.sourceName, sourceUrl: CO2_INDICATOR.sourceUrl, scaleMin: CO2_INDICATOR.scaleMin, scaleMax: CO2_INDICATOR.scaleMax, higherIsBetter: CO2_INDICATOR.higherIsBetter },
  });

  process.stdout.write(`  co2_emissions (OWID 2015–${LATEST_YEAR})... `);
  const co2Points = await fetchCO2();
  console.log(`${co2Points.length} raw points`);
  const co2Total = await upsertValues(CO2_INDICATOR.id, co2Points, CO2_INDICATOR.scaleMin, CO2_INDICATOR.scaleMax, CO2_INDICATOR.higherIsBetter, knownISO3);
  console.log(`  ✅ co2_emissions: ${co2Total} values upserted\n`);

  // ── 2. World Bank indicators (homicide + freedom) ─────────────────────────
  for (const ind of WB_INDICATORS) {
    // Ensure indicator record exists
    await prisma.indicator.upsert({
      where:  { id: ind.id },
      update: { name: ind.name, theme: ind.theme, sourceName: ind.sourceName, sourceUrl: ind.sourceUrl, scaleMin: ind.scaleMin, scaleMax: ind.scaleMax, higherIsBetter: ind.higherIsBetter },
      create: { id: ind.id, name: ind.name, theme: ind.theme, sourceName: ind.sourceName, sourceUrl: ind.sourceUrl, scaleMin: ind.scaleMin, scaleMax: ind.scaleMax, higherIsBetter: ind.higherIsBetter },
    });

    process.stdout.write(`  ${ind.id} (historical 2015–2023)... `);
    const hist = await fetchWBRange(ind.wbCode, 2015, 2023);
    console.log(`${hist.length} raw points`);
    await sleep(2000);

    process.stdout.write(`  ${ind.id} (current ${LATEST_YEAR})... `);
    const mrv = await fetchWBMRV(ind.wbCode);
    console.log(`${mrv.length} raw points`);
    await sleep(2000);

    const total = await upsertValues(ind.id, [...hist, ...mrv], ind.scaleMin, ind.scaleMax, ind.higherIsBetter, knownISO3);
    console.log(`  ✅ ${ind.id}: ${total} values upserted\n`);
  }

  // ── 3. Happiness (OWID) ──────────────────────────────────────────────────
  await prisma.indicator.upsert({
    where:  { id: HAPPINESS_INDICATOR.id },
    update: { name: HAPPINESS_INDICATOR.name, theme: HAPPINESS_INDICATOR.theme, sourceName: HAPPINESS_INDICATOR.sourceName, sourceUrl: HAPPINESS_INDICATOR.sourceUrl, scaleMin: HAPPINESS_INDICATOR.scaleMin, scaleMax: HAPPINESS_INDICATOR.scaleMax, higherIsBetter: HAPPINESS_INDICATOR.higherIsBetter },
    create: { id: HAPPINESS_INDICATOR.id, name: HAPPINESS_INDICATOR.name, theme: HAPPINESS_INDICATOR.theme, sourceName: HAPPINESS_INDICATOR.sourceName, sourceUrl: HAPPINESS_INDICATOR.sourceUrl, scaleMin: HAPPINESS_INDICATOR.scaleMin, scaleMax: HAPPINESS_INDICATOR.scaleMax, higherIsBetter: HAPPINESS_INDICATOR.higherIsBetter },
  });

  process.stdout.write(`  happiness_index (OWID 2011–${LATEST_YEAR})... `);
  const happinessPoints = await fetchHappiness();
  console.log(`${happinessPoints.length} raw points`);
  const happTotal = await upsertValues(
    HAPPINESS_INDICATOR.id, happinessPoints,
    HAPPINESS_INDICATOR.scaleMin, HAPPINESS_INDICATOR.scaleMax, HAPPINESS_INDICATOR.higherIsBetter,
    knownISO3,
  );
  console.log(`  ✅ happiness_index: ${happTotal} values upserted\n`);

  // ── 4. Recompute scores for all years ────────────────────────────────────
  console.log('🔢 Recomputing scores for all years...');
  const years = await prisma.countryIndicatorValue.findMany({ select: { year: true }, distinct: ['year'] });

  for (const { year } of years.sort((a, b) => a.year - b.year)) {
    const values = await prisma.countryIndicatorValue.findMany({ where: { year }, select: { iso3: true, valueNorm: true } });
    const byCountry = new Map<string, number[]>();
    for (const v of values) {
      if (!byCountry.has(v.iso3)) byCountry.set(v.iso3, []);
      byCountry.get(v.iso3)!.push(v.valueNorm);
    }
    let count = 0;
    for (const [iso3, norms] of byCountry) {
      const score = norms.reduce((a, b) => a + b, 0) / norms.length;
      const coverageRatio = norms.length / TOTAL_INDICATORS;
      await prisma.computedScore.upsert({
        where:  { iso3_profileId_year: { iso3, profileId: 'default', year } },
        update: { score, coverageRatio },
        create: { iso3, profileId: 'default', year, score, coverageRatio },
      });
      count++;
    }
    console.log(`  ${year}: ${count} countries`);
  }

  console.log('\n🎉 Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
