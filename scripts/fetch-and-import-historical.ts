/**
 * Fetches World Bank data for 2015–2025 and upserts it into the DB.
 * Safe to re-run — uses upsert throughout.
 *
 * Run with: npx tsx scripts/fetch-and-import-historical.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const YEAR_FROM = 2015;
const YEAR_TO   = 2025;
// Note: TOTAL_INDICATORS is computed dynamically per year during score recomputation.
// Do NOT hardcode it — the number of indicators with data varies by year.

const INDICATORS = [
  { id: 'gdp_per_capita',        code: 'NY.GDP.PCAP.CD',       scaleMin: 0,  scaleMax: 100000, higherIsBetter: true  },
  { id: 'life_expectancy',       code: 'SP.DYN.LE00.IN',       scaleMin: 50, scaleMax: 90,     higherIsBetter: true  },
  { id: 'unemployment_rate',     code: 'SL.UEM.TOTL.ZS',       scaleMin: 0,  scaleMax: 30,     higherIsBetter: false },
  // co2_emissions: WB code EN.ATM.CO2E.PC is broken — imported separately from OWID CSV
  { id: 'internet_access',       code: 'IT.NET.USER.ZS',       scaleMin: 0,  scaleMax: 100,    higherIsBetter: true  },
  { id: 'education_expenditure', code: 'SE.XPD.TOTL.GD.ZS',   scaleMin: 0,  scaleMax: 10,     higherIsBetter: true  },
  { id: 'health_expenditure',    code: 'SH.XPD.CHEX.GD.ZS',   scaleMin: 0,  scaleMax: 20,     higherIsBetter: true  },
  { id: 'infant_mortality',      code: 'SP.DYN.IMRT.IN',       scaleMin: 0,  scaleMax: 100,    higherIsBetter: false },
  { id: 'gini_coefficient',      code: 'SI.POV.GINI',          scaleMin: 20, scaleMax: 70,     higherIsBetter: false },
  { id: 'clean_water_access',    code: 'SH.H2O.SMDW.ZS',       scaleMin: 0,  scaleMax: 100,    higherIsBetter: true  },
];

function normalize(value: number, scaleMin: number, scaleMax: number, higherIsBetter: boolean): number {
  let n = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
  if (!higherIsBetter) n = 100 - n;
  return Math.max(0, Math.min(100, n));
}

interface WBRecord {
  iso3: string;
  indicatorId: string;
  year: number;
  value: number;
  valueNorm: number;
}

async function fetchIndicator(
  indicator: (typeof INDICATORS)[number],
  attempt = 1,
): Promise<WBRecord[]> {
  const url =
    `https://api.worldbank.org/v2/country/all/indicator/${indicator.code}` +
    `?format=json&date=${YEAR_FROM}:${YEAR_TO}&per_page=10000`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    // Detect HTML error page (rate limit / server error)
    if (text.trimStart().startsWith('<')) {
      throw new Error('HTML response (rate limited)');
    }

    const data = JSON.parse(text);

    if (!data[1]) {
      console.warn(`  ⚠️  No data for ${indicator.id}`);
      return [];
    }

    return (data[1] as any[])
      .filter((r) => r.value !== null && r.countryiso3code)
      .map((r) => ({
        iso3: r.countryiso3code,
        indicatorId: indicator.id,
        year: parseInt(r.date),
        value: parseFloat(r.value),
        valueNorm: normalize(parseFloat(r.value), indicator.scaleMin, indicator.scaleMax, indicator.higherIsBetter),
      }));
  } catch (err) {
    if (attempt >= 4) {
      console.warn(`  ❌ Failed after ${attempt} attempts: ${indicator.id}`);
      return [];
    }
    const wait = attempt * 5000;
    process.stdout.write(` (retry ${attempt} in ${wait / 1000}s)... `);
    await new Promise((r) => setTimeout(r, wait));
    return fetchIndicator(indicator, attempt + 1);
  }
}

async function main() {
  console.log(`\n🌍 Fetching World Bank data ${YEAR_FROM}–${YEAR_TO}...\n`);

  // Load set of known ISO3 codes from DB to filter out WB regional aggregates
  const countries = await prisma.country.findMany({ select: { iso3: true } });
  const knownISO3 = new Set(countries.map((c) => c.iso3));

  const allRecords: WBRecord[] = [];

  for (const indicator of INDICATORS) {
    process.stdout.write(`  ${indicator.id}... `);
    const records = await fetchIndicator(indicator);
    const filtered = records.filter((r) => knownISO3.has(r.iso3));
    allRecords.push(...filtered);
    console.log(`${filtered.length} records`);
    await new Promise((r) => setTimeout(r, 2000)); // be polite to the API
  }

  console.log(`\n💾 Upserting ${allRecords.length} values into DB...`);

  let done = 0;
  for (const rec of allRecords) {
    await prisma.countryIndicatorValue.upsert({
      where: { iso3_indicatorId_year: { iso3: rec.iso3, indicatorId: rec.indicatorId, year: rec.year } },
      update:  { value: rec.value, valueNorm: rec.valueNorm },
      create:  { iso3: rec.iso3, indicatorId: rec.indicatorId, year: rec.year, value: rec.value, valueNorm: rec.valueNorm },
    });
    done++;
    if (done % 500 === 0) console.log(`  ${done}/${allRecords.length}`);
  }

  console.log(`✅ Values upserted\n`);

  // Recompute scores per (country, year)
  console.log('🔢 Recomputing scores per country per year...');

  const years = Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => YEAR_FROM + i);

  for (const year of years) {
    process.stdout.write(`  ${year}... `);
    const values = await prisma.countryIndicatorValue.findMany({
      where: { year },
      select: { iso3: true, valueNorm: true },
    });
    if (values.length === 0) { console.log('no data'); continue; }

    // Dynamic total: how many distinct indicators have data for this year
    const indForYear = await prisma.countryIndicatorValue.findMany({
      where: { year },
      select: { indicatorId: true },
      distinct: ['indicatorId'],
    });
    const totalForYear = indForYear.length;

    // Group by country
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
        where: { iso3_profileId_year: { iso3, profileId: 'default', year } },
        update:  { score, coverageRatio },
        create:  { iso3, profileId: 'default', year, score, coverageRatio },
      });
      count++;
    }
    console.log(`${count} countries (${totalForYear} indicators)`);
  }

  console.log('\n🎉 Done!');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
