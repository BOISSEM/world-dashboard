/**
 * Imports 1 environment indicator:
 *   - air_pollution : World Bank EN.ATM.PM25.MC.M3
 *                     (PM2.5 mean annual exposure, µg/m³)
 *
 * Strategy:
 *   - Historical years 2015–2023 stored with their actual year.
 *   - Most recent available value per country also stored as year=2024.
 *   - Included in global ComputedScore (not informational-only).
 *
 * Run with: npx tsx scripts/import-air-pollution.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LATEST_YEAR = 2024;

const INDICATOR = {
  id: 'air_pollution',
  name: 'Air Pollution (PM2.5)',
  theme: 'Environment',
  sourceName: 'World Bank / WHO',
  sourceUrl: 'https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3',
  wbCode: 'EN.ATM.PM25.MC.M3',
  scaleMin: 0,
  scaleMax: 150,
  higherIsBetter: false,
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RawPoint { iso3: string; year: number; value: number; }

function normalize(value: number, scaleMin: number, scaleMax: number, higherIsBetter: boolean): number {
  let n = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
  if (!higherIsBetter) n = 100 - n;
  return Math.max(0, Math.min(100, n));
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// World Bank fetch helpers
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
    process.stdout.write(` (retry ${attempt} in ${wait / 1000}s)...`);
    await sleep(wait);
    return fetchWBRange(code, yearFrom, yearTo, attempt + 1);
  }
}

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
      where:  { iso3_indicatorId_year: { iso3: p.iso3, indicatorId, year: p.year } },
      update: { value: p.value, valueNorm },
      create: { iso3: p.iso3, indicatorId, year: p.year, value: p.value, valueNorm },
    });
    done++;
  }
  return done;
}

// ---------------------------------------------------------------------------
// Score recomputation (military_expenditure excluded, same as geopolitics)
// ---------------------------------------------------------------------------

const SCORE_EXCLUDED = new Set(['military_expenditure']);

async function recomputeScores() {
  console.log('\n🔢 Recomputing global scores...');

  const years = await prisma.countryIndicatorValue.findMany({
    select: { year: true },
    distinct: ['year'],
  });

  for (const { year } of years.sort((a, b) => a.year - b.year)) {
    const values = await prisma.countryIndicatorValue.findMany({
      where: { year, NOT: { indicatorId: { in: [...SCORE_EXCLUDED] } } },
      select: { iso3: true, valueNorm: true },
    });
    if (values.length === 0) continue;

    const indForYear = await prisma.countryIndicatorValue.findMany({
      where: { year, NOT: { indicatorId: { in: [...SCORE_EXCLUDED] } } },
      select: { indicatorId: true },
      distinct: ['indicatorId'],
    });
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
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🌫️  Importing air pollution indicator (PM2.5)...\n');

  const countries = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3 = new Set(countries.map(c => c.iso3));

  // Upsert indicator metadata
  await prisma.indicator.upsert({
    where:  { id: INDICATOR.id },
    update: { name: INDICATOR.name, theme: INDICATOR.theme, sourceName: INDICATOR.sourceName, sourceUrl: INDICATOR.sourceUrl, scaleMin: INDICATOR.scaleMin, scaleMax: INDICATOR.scaleMax, higherIsBetter: INDICATOR.higherIsBetter },
    create: { id: INDICATOR.id, name: INDICATOR.name, theme: INDICATOR.theme, sourceName: INDICATOR.sourceName, sourceUrl: INDICATOR.sourceUrl, scaleMin: INDICATOR.scaleMin, scaleMax: INDICATOR.scaleMax, higherIsBetter: INDICATOR.higherIsBetter },
  });

  process.stdout.write(`  ${INDICATOR.id} (historical 2015–2023)... `);
  const hist = await fetchWBRange(INDICATOR.wbCode, 2015, 2023);
  console.log(`${hist.length} raw points`);
  await sleep(2000);

  process.stdout.write(`  ${INDICATOR.id} (current ${LATEST_YEAR})... `);
  const mrv = await fetchWBMRV(INDICATOR.wbCode);
  console.log(`${mrv.length} raw points`);
  await sleep(2000);

  const total = await upsertValues(
    INDICATOR.id,
    [...hist, ...mrv],
    INDICATOR.scaleMin,
    INDICATOR.scaleMax,
    INDICATOR.higherIsBetter,
    knownISO3,
  );
  console.log(`  ✅ ${INDICATOR.id}: ${total} values upserted\n`);

  await recomputeScores();

  console.log('\n🎉 Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
