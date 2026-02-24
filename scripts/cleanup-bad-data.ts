/**
 * Removes unreliable indicators and all 2026 data (from the corrupted original import).
 * Safe to re-run.
 *
 * Run with: npx tsx scripts/cleanup-bad-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Indicators with verified bad data (wrong values, wrong scale, or inverted)
const BAD_INDICATORS = [
  'freedom_score',           // China=50, reality=9
  'press_freedom',           // USA=rank 2, reality=~55
  'inflation_rate',          // China=9.4%, reality=0.2%
  'economic_competitiveness',// Italy=98.6, impossible
  'environmental_performance',// Israel=94, reality~60
  'happiness_index',         // Japan=8.4, wrong scale
  'crime_rate',              // Norway=6.3, reality=0.47/100k
  'co2_emissions',           // France=14.9, reality=4.5 — and WB code broken
];

async function main() {
  console.log('🧹 Cleaning up bad indicator data...\n');

  // 1. Delete all year=2026 data (entirely from the corrupted original import)
  const deletedValues = await prisma.countryIndicatorValue.deleteMany({ where: { year: 2026 } });
  console.log(`✅ Deleted ${deletedValues.count} CountryIndicatorValues for year 2026`);

  const deletedScores = await prisma.computedScore.deleteMany({ where: { year: 2026 } });
  console.log(`✅ Deleted ${deletedScores.count} ComputedScores for year 2026`);

  // 2. Delete bad indicator records (cascade deletes remaining values)
  for (const id of BAD_INDICATORS) {
    const indicator = await prisma.indicator.findUnique({ where: { id } });
    if (!indicator) {
      console.log(`  ⏭  ${id} — not found, skipping`);
      continue;
    }
    await prisma.countryIndicatorValue.deleteMany({ where: { indicatorId: id } });
    await prisma.indicator.delete({ where: { id } });
    console.log(`  🗑  Deleted indicator: ${id}`);
  }

  // 3. Summary of what remains
  const remaining = await prisma.indicator.findMany({ orderBy: { theme: 'asc' }, select: { id: true, theme: true, sourceName: true } });
  const years = await prisma.computedScore.findMany({ select: { year: true }, distinct: ['year'], orderBy: { year: 'asc' } });

  console.log(`\n📊 Remaining indicators (${remaining.length}):`);
  remaining.forEach(i => console.log(`  ${i.theme.padEnd(25)} ${i.id.padEnd(30)} ${i.sourceName}`));

  console.log(`\n📅 Years with data: ${years.map(y => y.year).join(', ')}`);

  await prisma.$disconnect();
  console.log('\n🎉 Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
