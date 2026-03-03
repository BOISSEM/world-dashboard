/**
 * Imports 3 geopolitics indicators:
 *   - political_stability  : World Bank WGI PV.EST (Political Stability & Absence of Violence)
 *   - military_expenditure : World Bank MS.MIL.XPND.GD.ZS (% of GDP) — informational, excluded from global score
 *   - refugees_produced    : SM.POP.REFG.OR / SP.POP.TOTL × 1000 (refugees per 1,000 people)
 *
 * Strategy:
 *   - Historical years 2015–2023 stored with their actual year.
 *   - Most recent available value per country also stored as year=2024.
 *   - military_expenditure is stored but excluded from the global ComputedScore.
 *
 * Run with: npx tsx scripts/import-geopolitics.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LATEST_YEAR = 2024;

// Excluded from global score computation (informational only)
const SCORE_EXCLUDED = new Set(['military_expenditure']);

// ---------------------------------------------------------------------------
// Indicator definitions
// ---------------------------------------------------------------------------

const SIMPLE_WB_INDICATORS = [
  {
    id: 'political_stability',
    name: 'Political Stability',
    theme: 'Geopolitics',
    sourceName: 'World Bank WGI',
    sourceUrl: 'https://info.worldbank.org/governance/wgi/',
    wbCode: 'PV.EST',
    scaleMin: -2.5, scaleMax: 2.5, higherIsBetter: true,
  },
  {
    id: 'military_expenditure',
    name: 'Military Expenditure (% GDP)',
    theme: 'Geopolitics',
    sourceName: 'World Bank / SIPRI',
    sourceUrl: 'https://data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS',
    wbCode: 'MS.MIL.XPND.GD.ZS',
    scaleMin: 0, scaleMax: 10, higherIsBetter: false,
  },
] as const;

const REFUGEES_INDICATOR = {
  id: 'refugees_produced',
  name: 'Refugees per 1,000 People',
  theme: 'Geopolitics',
  sourceName: 'UNHCR / World Bank',
  sourceUrl: 'https://data.worldbank.org/indicator/SM.POP.REFG.OR',
  scaleMin: 0, scaleMax: 100, higherIsBetter: false,
};

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
// Refugees: UNHCR API (by country of origin) / SP.POP.TOTL × 1000
// ---------------------------------------------------------------------------

async function fetchUNHCRYear(iso3List: string[], year: number, attempt = 1): Promise<Map<string, number>> {
  // UNHCR accepts comma-separated ISO3 codes; countries with 0 refugees won't appear in response
  const url = `https://api.unhcr.org/population/v1/population/?limit=500&year=${year}&coo=${iso3List.join(',')}`;
  try {
    const res  = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json() as { items?: { coo_iso: string; refugees: string | number }[] };
    const map = new Map<string, number>();
    for (const item of data.items ?? []) {
      const n = parseInt(String(item.refugees));
      if (!isNaN(n) && item.coo_iso) map.set(item.coo_iso, n);
    }
    return map;
  } catch {
    if (attempt >= 4) { console.warn(`    ❌ UNHCR fetch failed for ${year}`); return new Map(); }
    const wait = attempt * 5000;
    process.stdout.write(` (retry ${attempt} in ${wait / 1000}s)...`);
    await sleep(wait);
    return fetchUNHCRYear(iso3List, year, attempt + 1);
  }
}

async function fetchRefugees(knownISO3: Set<string>): Promise<RawPoint[]> {
  const iso3List = [...knownISO3];

  // Population lookup from World Bank
  process.stdout.write('  population (SP.POP.TOTL, historical)... ');
  const popHist = await fetchWBRange('SP.POP.TOTL', 2015, 2023);
  console.log(`${popHist.length} points`);
  await sleep(2000);

  process.stdout.write('  population (SP.POP.TOTL, MRV)... ');
  const popMRV = await fetchWBMRV('SP.POP.TOTL');
  console.log(`${popMRV.length} points`);
  await sleep(2000);

  const popMap = new Map<string, number>();
  for (const p of [...popHist, ...popMRV]) popMap.set(`${p.iso3}:${p.year}`, p.value);

  const results: RawPoint[] = [];
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, LATEST_YEAR];

  for (const year of years) {
    process.stdout.write(`  UNHCR refugees by origin ${year}... `);
    const refugeeMap = await fetchUNHCRYear(iso3List, year);
    console.log(`${refugeeMap.size} countries with refugees`);
    await sleep(1000);

    for (const iso3 of iso3List) {
      const refugees = refugeeMap.get(iso3) ?? 0;
      // Fallback: use population from adjacent year if current year missing
      const pop = popMap.get(`${iso3}:${year}`) ?? popMap.get(`${iso3}:${LATEST_YEAR}`);
      if (!pop || pop === 0) continue;
      const per1000 = (refugees / pop) * 1000;
      results.push({ iso3, year, value: per1000 });
    }
  }
  return results;
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
// Score recomputation (excludes informational indicators)
// ---------------------------------------------------------------------------

async function recomputeScores() {
  console.log('\n🔢 Recomputing global scores (excluding informational indicators)...');

  const years = await prisma.countryIndicatorValue.findMany({
    select: { year: true },
    distinct: ['year'],
  });

  for (const { year } of years.sort((a, b) => a.year - b.year)) {
    // Exclude informational indicators from score computation
    const values = await prisma.countryIndicatorValue.findMany({
      where: { year, NOT: { indicatorId: { in: [...SCORE_EXCLUDED] } } },
      select: { iso3: true, valueNorm: true },
    });
    if (values.length === 0) { continue; }

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
    console.log(`  ${year}: ${count} countries (${totalForYear} indicators, excl. informational)`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🌍 Importing geopolitics indicators...\n');

  const countries = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3 = new Set(countries.map(c => c.iso3));

  // ── 1. political_stability + military_expenditure (World Bank) ─────────────
  for (const ind of SIMPLE_WB_INDICATORS) {
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
    const note = SCORE_EXCLUDED.has(ind.id) ? ' [informational — excluded from global score]' : '';
    console.log(`  ✅ ${ind.id}: ${total} values upserted${note}\n`);
  }

  // ── 2. refugees_produced (computed from 2 WB indicators) ─────────────────
  await prisma.indicator.upsert({
    where:  { id: REFUGEES_INDICATOR.id },
    update: { name: REFUGEES_INDICATOR.name, theme: REFUGEES_INDICATOR.theme, sourceName: REFUGEES_INDICATOR.sourceName, sourceUrl: REFUGEES_INDICATOR.sourceUrl, scaleMin: REFUGEES_INDICATOR.scaleMin, scaleMax: REFUGEES_INDICATOR.scaleMax, higherIsBetter: REFUGEES_INDICATOR.higherIsBetter },
    create: { id: REFUGEES_INDICATOR.id, name: REFUGEES_INDICATOR.name, theme: REFUGEES_INDICATOR.theme, sourceName: REFUGEES_INDICATOR.sourceName, sourceUrl: REFUGEES_INDICATOR.sourceUrl, scaleMin: REFUGEES_INDICATOR.scaleMin, scaleMax: REFUGEES_INDICATOR.scaleMax, higherIsBetter: REFUGEES_INDICATOR.higherIsBetter },
  });

  console.log('  refugees_produced (UNHCR by origin / population × 1000):');
  const refugeePoints = await fetchRefugees(knownISO3);
  const refTotal = await upsertValues(REFUGEES_INDICATOR.id, refugeePoints, REFUGEES_INDICATOR.scaleMin, REFUGEES_INDICATOR.scaleMax, REFUGEES_INDICATOR.higherIsBetter, knownISO3);
  console.log(`  ✅ refugees_produced: ${refTotal} values upserted\n`);

  // ── 3. Recompute global scores ─────────────────────────────────────────────
  await recomputeScores();

  console.log('\n🎉 Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
