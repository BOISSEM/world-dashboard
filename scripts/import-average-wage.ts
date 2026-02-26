/**
 * Imports the "Average Wage per Capita" indicator using World Bank GNI per capita.
 *
 * Source: World Bank — Gross National Income (GNI) per capita, Atlas method (current US$)
 * WB code: NY.GNP.PCAP.CD
 *
 * Strategy:
 *   - Historical years 2015–2023 stored with their actual year.
 *   - Most recent available value per country also stored as year=2024 (LATEST_DATA_YEAR).
 *
 * Run with: npx tsx scripts/import-average-wage.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LATEST_YEAR = 2024;

// ---------------------------------------------------------------------------
// Indicator definition
// ---------------------------------------------------------------------------
const AVERAGE_WAGE_INDICATOR = {
  id: 'average_wage',
  name: 'Average Income per Capita',
  theme: 'Economy',
  sourceName: 'World Bank (GNI per capita)',
  sourceUrl: 'https://data.worldbank.org/indicator/NY.GNP.PCAP.CD',
  wbCode: 'NY.GNP.PCAP.CD',
  scaleMin: 0,
  scaleMax: 90000, // USD — covers the global range (Luxembourg, Switzerland ~80–85k)
  higherIsBetter: true,
} as const;

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
// World Bank fetch helpers (same pattern as import-missing-indicators.ts)
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

// MRV=1: most recent value per country, stored as LATEST_YEAR
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
// Upsert helper
// ---------------------------------------------------------------------------
async function upsertValues(
  indicatorId: string,
  points: RawPoint[],
  scaleMin: number,
  scaleMax: number,
  higherIsBetter: boolean,
  knownISO3: Set<string>,
): Promise<number> {
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
  console.log('\n💰 Importing Average Income per Capita (GNI per capita, World Bank)...\n');

  const countries = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3 = new Set(countries.map(c => c.iso3));

  const ind = AVERAGE_WAGE_INDICATOR;

  // Upsert indicator metadata
  await prisma.indicator.upsert({
    where:  { id: ind.id },
    update: { name: ind.name, theme: ind.theme, sourceName: ind.sourceName, sourceUrl: ind.sourceUrl, scaleMin: ind.scaleMin, scaleMax: ind.scaleMax, higherIsBetter: ind.higherIsBetter },
    create: { id: ind.id, name: ind.name, theme: ind.theme, sourceName: ind.sourceName, sourceUrl: ind.sourceUrl, scaleMin: ind.scaleMin, scaleMax: ind.scaleMax, higherIsBetter: ind.higherIsBetter },
  });
  console.log(`  ✅ Indicator "${ind.name}" upserted\n`);

  // Fetch historical data 2015–2023
  process.stdout.write(`  Fetching historical data 2015–2023... `);
  const hist = await fetchWBRange(ind.wbCode, 2015, 2023);
  console.log(`${hist.length} raw points`);
  await sleep(2000);

  // Fetch most recent value for LATEST_YEAR
  process.stdout.write(`  Fetching most recent value (year=${LATEST_YEAR})... `);
  const mrv = await fetchWBMRV(ind.wbCode);
  console.log(`${mrv.length} raw points`);
  await sleep(1000);

  // Upsert all values
  const total = await upsertValues(ind.id, [...hist, ...mrv], ind.scaleMin, ind.scaleMax, ind.higherIsBetter, knownISO3);
  console.log(`\n  ✅ ${ind.id}: ${total} values upserted\n`);

  // Show a quick sample of the data
  const sample = await prisma.countryIndicatorValue.findMany({
    where: { indicatorId: ind.id, year: LATEST_YEAR },
    orderBy: { value: 'desc' },
    take: 10,
    include: { country: { select: { name: true } } },
  });
  console.log(`  Top 10 countries by ${ind.name} (${LATEST_YEAR}):`);
  sample.forEach((v, i) => {
    console.log(`    ${i + 1}. ${v.country.name}: $${v.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} (score: ${v.valueNorm.toFixed(1)})`);
  });
  console.log();

  // Recompute global scores for all years
  console.log('🔢 Recomputing global scores for all years...');
  const years = await prisma.countryIndicatorValue.findMany({ select: { year: true }, distinct: ['year'] });

  for (const { year } of years.sort((a, b) => a.year - b.year)) {
    const values = await prisma.countryIndicatorValue.findMany({ where: { year }, select: { iso3: true, valueNorm: true } });
    const indForYear = await prisma.countryIndicatorValue.findMany({ where: { year }, select: { indicatorId: true }, distinct: ['indicatorId'] });
    const totalForYear = indForYear.length;
    const byCountry = new Map<string, number[]>();
    for (const v of values) {
      if (!byCountry.has(v.iso3)) byCountry.set(v.iso3, []);
      byCountry.get(v.iso3)!.push(v.valueNorm);
    }
    let count = 0;
    for (const [iso3, norms] of byCountry) {
      const score = norms.reduce((a, b) => a + b, 0) / norms.length;
      const coverageRatio = norms.length / totalForYear;
      await prisma.computedScore.upsert({
        where:  { iso3_profileId_year: { iso3, profileId: 'default', year } },
        update: { score, coverageRatio },
        create: { iso3, profileId: 'default', year, score, coverageRatio },
      });
      count++;
    }
    console.log(`  ${year}: ${count} countries (${totalForYear} indicators)`);
  }

  console.log('\n🎉 Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
