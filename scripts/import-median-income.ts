/**
 * Imports "Median Income per Capita" from Our World in Data (World Bank PIP).
 *
 * Source: OWID — Median daily per capita income or consumption (2017 int'l $, PPP-adjusted)
 * URL: https://ourworldindata.org/grapher/median-daily-per-capita-income.csv
 *
 * If coverage is insufficient (<120 countries), keeps the existing average_wage indicator.
 * Otherwise, removes average_wage and replaces it with median_income.
 *
 * Run with: npx tsx scripts/import-median-income.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LATEST_YEAR = 2024;
const MIN_COUNTRIES_THRESHOLD = 120; // minimum to consider median data usable

const MEDIAN_INDICATOR = {
  id: 'median_income',
  name: 'Median Income per Capita',
  theme: 'Economy',
  sourceName: 'Our World in Data / World Bank PIP',
  sourceUrl: 'https://ourworldindata.org/poverty',
  scaleMin: 0,
  scaleMax: 130, // int'l $/day — covers top countries (Luxembourg ~110-120)
  higherIsBetter: true,
} as const;

interface RawPoint { iso3: string; year: number; value: number; }

function normalize(value: number, scaleMin: number, scaleMax: number, higherIsBetter: boolean): number {
  let n = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
  if (!higherIsBetter) n = 100 - n;
  return Math.max(0, Math.min(100, n));
}

async function fetchMedianIncome(): Promise<RawPoint[]> {
  const url = 'https://ourworldindata.org/grapher/daily-median-income.csv';
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);

  if (lines.length < 2) throw new Error('Empty CSV response');

  const header = lines[0].split(',').map(h => h.trim());
  console.log(`  CSV columns: ${header.join(' | ')}`);

  // Find the data column (not Entity, Code, Year)
  const dataColIdx = header.findIndex((h, i) => i >= 3);
  if (dataColIdx < 0) throw new Error('Could not find data column');

  const rows: RawPoint[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const iso3  = cols[1]?.trim();
    const year  = parseInt(cols[2]);
    const value = parseFloat(cols[dataColIdx]);
    if (!iso3 || iso3.startsWith('OWID') || isNaN(year) || isNaN(value) || value <= 0) continue;
    if (year >= 2015) rows.push({ iso3, year, value });
  }

  // Most recent value per country → stored as LATEST_YEAR
  const latest = new Map<string, RawPoint>();
  for (const r of rows) {
    const cur = latest.get(r.iso3);
    if (!cur || r.year > cur.year) latest.set(r.iso3, r);
  }
  const currentYear: RawPoint[] = Array.from(latest.values()).map(r => ({ ...r, year: LATEST_YEAR }));

  return [...rows, ...currentYear];
}

async function upsertValues(points: RawPoint[], knownISO3: Set<string>): Promise<number> {
  const filtered = points.filter(p => knownISO3.has(p.iso3));
  let done = 0;
  for (const p of filtered) {
    const valueNorm = normalize(p.value, MEDIAN_INDICATOR.scaleMin, MEDIAN_INDICATOR.scaleMax, MEDIAN_INDICATOR.higherIsBetter);
    await prisma.countryIndicatorValue.upsert({
      where: { iso3_indicatorId_year: { iso3: p.iso3, indicatorId: MEDIAN_INDICATOR.id, year: p.year } },
      update:  { value: p.value, valueNorm },
      create:  { iso3: p.iso3, indicatorId: MEDIAN_INDICATOR.id, year: p.year, value: p.value, valueNorm },
    });
    done++;
  }
  return done;
}

async function recomputeScores() {
  console.log('\n🔢 Recomputing global scores for all years...');
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
}

async function main() {
  console.log('\n📊 Importing Median Income per Capita (OWID / World Bank PIP)...\n');

  const countries = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3 = new Set(countries.map(c => c.iso3));

  // Fetch OWID data
  let points: RawPoint[];
  try {
    points = await fetchMedianIncome();
  } catch (e) {
    console.error(`\n❌ Failed to fetch median income data: ${e}`);
    console.log('Keeping existing average_wage indicator. No changes made.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const uniqueCountries = new Set(
    points.filter(p => p.year === LATEST_YEAR && knownISO3.has(p.iso3)).map(p => p.iso3)
  );
  console.log(`  Coverage: ${uniqueCountries.size} countries with data for ${LATEST_YEAR}`);

  if (uniqueCountries.size < MIN_COUNTRIES_THRESHOLD) {
    console.log(`\n⚠️  Only ${uniqueCountries.size} countries found (threshold: ${MIN_COUNTRIES_THRESHOLD}).`);
    console.log('Coverage too low — keeping existing average_wage indicator. No changes made.');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(`  ✅ Coverage sufficient (${uniqueCountries.size} countries). Proceeding with import.\n`);

  // Upsert indicator metadata
  await prisma.indicator.upsert({
    where:  { id: MEDIAN_INDICATOR.id },
    update: { name: MEDIAN_INDICATOR.name, theme: MEDIAN_INDICATOR.theme, sourceName: MEDIAN_INDICATOR.sourceName, sourceUrl: MEDIAN_INDICATOR.sourceUrl, scaleMin: MEDIAN_INDICATOR.scaleMin, scaleMax: MEDIAN_INDICATOR.scaleMax, higherIsBetter: MEDIAN_INDICATOR.higherIsBetter },
    create: { id: MEDIAN_INDICATOR.id, name: MEDIAN_INDICATOR.name, theme: MEDIAN_INDICATOR.theme, sourceName: MEDIAN_INDICATOR.sourceName, sourceUrl: MEDIAN_INDICATOR.sourceUrl, scaleMin: MEDIAN_INDICATOR.scaleMin, scaleMax: MEDIAN_INDICATOR.scaleMax, higherIsBetter: MEDIAN_INDICATOR.higherIsBetter },
  });

  const total = await upsertValues(points, knownISO3);
  console.log(`  ✅ median_income: ${total} values upserted\n`);

  // Top 10
  const sample = await prisma.countryIndicatorValue.findMany({
    where: { indicatorId: MEDIAN_INDICATOR.id, year: LATEST_YEAR },
    orderBy: { value: 'desc' },
    take: 10,
    include: { country: { select: { name: true } } },
  });
  console.log(`  Top 10 countries by Median Income (${LATEST_YEAR}, int'l $/day):`);
  sample.forEach((v, i) => {
    console.log(`    ${i + 1}. ${v.country.name}: $${v.value.toFixed(1)}/day (score: ${v.valueNorm.toFixed(1)})`);
  });

  // Remove average_wage since median is now available
  console.log('\n🗑️  Removing average_wage indicator (replaced by median_income)...');
  await prisma.countryIndicatorValue.deleteMany({ where: { indicatorId: 'average_wage' } });
  await prisma.indicator.deleteMany({ where: { id: 'average_wage' } });
  console.log('  ✅ average_wage removed');

  await recomputeScores();

  console.log('\n🎉 Done! Median income successfully imported and average_wage removed.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
