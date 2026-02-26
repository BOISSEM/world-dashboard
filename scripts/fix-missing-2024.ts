/**
 * Fixes indicators that have 0 countries for year=2024 by fetching the most
 * recent available value (MRV) from World Bank and storing it as year=2024.
 *
 * Also adds doctors_per_1000 (SH.MED.PHYS.ZS) as a new health indicator.
 *
 * Safe to re-run — uses upsert throughout.
 * Run with: npx tsx scripts/fix-missing-2024.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LATEST_YEAR = 2024;

// Indicators to fix with MRV + optional new ones to add
const INDICATORS = [
  // Existing — fix MRV for 2024
  { id: 'life_expectancy',       code: 'SP.DYN.LE00.IN',     scaleMin: 50,  scaleMax: 90,    higherIsBetter: true,  name: null },
  { id: 'infant_mortality',      code: 'SP.DYN.IMRT.IN',     scaleMin: 0,   scaleMax: 100,   higherIsBetter: false, name: null },
  { id: 'health_expenditure',    code: 'SH.XPD.CHEX.GD.ZS',  scaleMin: 0,   scaleMax: 20,    higherIsBetter: true,  name: null },
  { id: 'internet_access',       code: 'IT.NET.USER.ZS',      scaleMin: 0,   scaleMax: 100,   higherIsBetter: true,  name: null },
  { id: 'education_expenditure', code: 'SE.XPD.TOTL.GD.ZS',  scaleMin: 0,   scaleMax: 10,    higherIsBetter: true,  name: null },
  { id: 'clean_water_access',    code: 'SH.H2O.SMDW.ZS',     scaleMin: 0,   scaleMax: 100,   higherIsBetter: true,  name: null },
  // New health indicator
  {
    id: 'doctors_per_1000',
    code: 'SH.MED.PHYS.ZS',
    scaleMin: 0, scaleMax: 10, higherIsBetter: true,
    name: 'Physicians per 1,000 People',
    theme: 'Health',
    sourceName: 'World Bank',
    sourceUrl: 'https://data.worldbank.org/indicator/SH.MED.PHYS.ZS',
  },
] as const;

function normalize(value: number, scaleMin: number, scaleMax: number, higherIsBetter: boolean): number {
  let n = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
  if (!higherIsBetter) n = 100 - n;
  return Math.max(0, Math.min(100, n));
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

interface RawPoint { iso3: string; value: number; }

async function fetchMRV(code: string, attempt = 1): Promise<RawPoint[]> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&MRV=1&per_page=1000`;
  try {
    const res  = await fetch(url);
    const text = await res.text();
    if (text.trimStart().startsWith('<')) throw new Error('HTML response');
    const data = JSON.parse(text);
    if (!data[1] || data[1].length === 0) return [];
    return (data[1] as any[])
      .filter(r => r.value !== null && r.countryiso3code)
      .map(r => ({ iso3: r.countryiso3code, value: parseFloat(r.value) }));
  } catch {
    if (attempt >= 4) { console.warn(`    ❌ Failed`); return []; }
    await sleep(attempt * 5000);
    return fetchMRV(code, attempt + 1);
  }
}

async function main() {
  console.log('\n🔧 Fixing missing 2024 data + adding doctors_per_1000...\n');

  const countries = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3 = new Set(countries.map(c => c.iso3));

  for (const ind of INDICATORS) {
    // Check current 2024 count
    const current2024 = await prisma.countryIndicatorValue.count({
      where: { indicatorId: ind.id, year: LATEST_YEAR },
    });

    // Upsert indicator metadata if it's a new one
    if (ind.name) {
      await prisma.indicator.upsert({
        where:  { id: ind.id },
        update: { name: ind.name, theme: (ind as any).theme, sourceName: (ind as any).sourceName, sourceUrl: (ind as any).sourceUrl, scaleMin: ind.scaleMin, scaleMax: ind.scaleMax, higherIsBetter: ind.higherIsBetter },
        create: { id: ind.id, name: ind.name, theme: (ind as any).theme, sourceName: (ind as any).sourceName, sourceUrl: (ind as any).sourceUrl, scaleMin: ind.scaleMin, scaleMax: ind.scaleMax, higherIsBetter: ind.higherIsBetter },
      });
    }

    process.stdout.write(`  ${ind.id} (currently ${current2024} in 2024)... `);

    const points = await fetchMRV(ind.code);
    const filtered = points.filter(p => knownISO3.has(p.iso3));

    let done = 0;
    for (const p of filtered) {
      const valueNorm = normalize(p.value, ind.scaleMin, ind.scaleMax, ind.higherIsBetter);
      await prisma.countryIndicatorValue.upsert({
        where: { iso3_indicatorId_year: { iso3: p.iso3, indicatorId: ind.id, year: LATEST_YEAR } },
        update:  { value: p.value, valueNorm },
        create:  { iso3: p.iso3, indicatorId: ind.id, year: LATEST_YEAR, value: p.value, valueNorm },
      });
      done++;
    }
    console.log(`→ ${done} pays upsertés`);
    await sleep(2000);
  }

  // Top 10 doctors_per_1000 as sanity check
  const sample = await prisma.countryIndicatorValue.findMany({
    where: { indicatorId: 'doctors_per_1000', year: LATEST_YEAR },
    orderBy: { value: 'desc' },
    take: 5,
    include: { country: { select: { name: true } } },
  });
  if (sample.length) {
    console.log('\n  Top 5 — Physicians per 1,000:');
    sample.forEach((v, i) => console.log(`    ${i+1}. ${v.country.name}: ${v.value.toFixed(2)}`));
  }

  // Recompute scores for 2024
  console.log('\n🔢 Recomputing scores for 2024...');
  const values = await prisma.countryIndicatorValue.findMany({
    where: { year: LATEST_YEAR },
    select: { iso3: true, valueNorm: true },
  });
  const indForYear = await prisma.countryIndicatorValue.findMany({
    where: { year: LATEST_YEAR },
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
      where:  { iso3_profileId_year: { iso3, profileId: 'default', year: LATEST_YEAR } },
      update: { score, coverageRatio },
      create: { iso3, profileId: 'default', year: LATEST_YEAR, score, coverageRatio },
    });
    count++;
  }
  console.log(`  2024: ${count} countries (${totalForYear} indicators)`);

  console.log('\n🎉 Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
