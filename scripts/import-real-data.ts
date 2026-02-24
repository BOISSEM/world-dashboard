import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface RealDataPoint {
  iso3: string;
  indicatorId: string;
  value: number;
  year: number;
}

interface IndicatorInfo {
  id: string;
  scaleMin: number;
  scaleMax: number;
  higherIsBetter: boolean;
}

// Informations sur les indicateurs pour la normalisation
const INDICATOR_INFO: Record<string, IndicatorInfo> = {
  gdp_per_capita: { id: 'gdp_per_capita', scaleMin: 0, scaleMax: 100000, higherIsBetter: true },
  life_expectancy: { id: 'life_expectancy', scaleMin: 50, scaleMax: 90, higherIsBetter: true },
  unemployment_rate: { id: 'unemployment_rate', scaleMin: 0, scaleMax: 30, higherIsBetter: false },
  co2_emissions: { id: 'co2_emissions', scaleMin: 0, scaleMax: 30, higherIsBetter: false },
  internet_access: { id: 'internet_access', scaleMin: 0, scaleMax: 100, higherIsBetter: true },
  education_expenditure: { id: 'education_expenditure', scaleMin: 0, scaleMax: 10, higherIsBetter: true },
  health_expenditure: { id: 'health_expenditure', scaleMin: 0, scaleMax: 20, higherIsBetter: true },
  infant_mortality: { id: 'infant_mortality', scaleMin: 0, scaleMax: 100, higherIsBetter: false },
  gini_coefficient: { id: 'gini_coefficient', scaleMin: 20, scaleMax: 70, higherIsBetter: false },
  clean_water_access: { id: 'clean_water_access', scaleMin: 0, scaleMax: 100, higherIsBetter: true },
};

function normalizeValue(value: number, indicator: IndicatorInfo): number {
  let normalized: number;

  if (indicator.higherIsBetter) {
    // Plus c'est haut, mieux c'est
    normalized = ((value - indicator.scaleMin) / (indicator.scaleMax - indicator.scaleMin)) * 100;
  } else {
    // Plus c'est bas, mieux c'est (inverser)
    normalized = 100 - ((value - indicator.scaleMin) / (indicator.scaleMax - indicator.scaleMin)) * 100;
  }

  // Limiter entre 0 et 100
  return Math.max(0, Math.min(100, normalized));
}

async function loadRealData(): Promise<Record<string, RealDataPoint[]>> {
  const dataPath = path.join(process.cwd(), 'data', 'real-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

async function importRealData() {
  console.log('🔄 Starting import of real data into database...\n');

  const realData = await loadRealData();
  
  console.log('📊 Data loaded:');
  Object.entries(realData).forEach(([indicator, points]) => {
    console.log(`   ${indicator}: ${points.length} countries`);
  });

  console.log('\n🗑️  Clearing old indicator values...');
  
  // Supprimer uniquement les valeurs des indicateurs qu'on va remplacer
  const indicatorsToUpdate = Object.keys(realData);
  await prisma.countryIndicatorValue.deleteMany({
    where: {
      indicatorId: { in: indicatorsToUpdate },
    },
  });

  console.log('✅ Old data cleared\n');

  let totalImported = 0;
  let skipped = 0;

  console.log('💾 Importing real data...');

  for (const [indicatorId, dataPoints] of Object.entries(realData)) {
    const indicatorInfo = INDICATOR_INFO[indicatorId];
    
    if (!indicatorInfo) {
      console.warn(`⚠️  No info for ${indicatorId}, skipping...`);
      continue;
    }

    console.log(`\n   📈 ${indicatorId}...`);

    for (const point of dataPoints) {
      try {
        // Vérifier que le pays existe
        const country = await prisma.country.findUnique({
          where: { iso3: point.iso3 },
        });

        if (!country) {
          skipped++;
          continue;
        }

        // Normaliser la valeur
        const valueNorm = normalizeValue(point.value, indicatorInfo);

        // Insérer dans la base
        await prisma.countryIndicatorValue.create({
          data: {
            iso3: point.iso3,
            indicatorId: point.indicatorId,
            year: point.year,
            value: point.value,
            valueNorm,
          },
        });

        totalImported++;
      } catch (error) {
        // Ignorer les erreurs (pays déjà existants, etc.)
        skipped++;
      }
    }

    console.log(`      ✅ Imported for ${indicatorId}`);
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   📊 Total imported: ${totalImported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);

  // Recalculer les scores globaux
  console.log('\n🔄 Recalculating global scores...');
  
  const countries = await prisma.country.findMany();
  
  for (const country of countries) {
    const values = await prisma.countryIndicatorValue.findMany({
      where: { iso3: country.iso3 },
    });

    if (values.length === 0) continue;

    const avgScore = values.reduce((sum, v) => sum + v.valueNorm, 0) / values.length;
    const coverageRatio = values.length / 30; // Sur 30 indicateurs totaux

    // Mettre à jour ou créer le score
    await prisma.computedScore.upsert({
      where: {
        iso3_profileId_year: {
          iso3: country.iso3,
          profileId: 'default',
          year: new Date().getFullYear(),
        },
      },
      update: {
        score: avgScore,
        coverageRatio,
      },
      create: {
        iso3: country.iso3,
        profileId: 'default',
        year: new Date().getFullYear(),
        score: avgScore,
        coverageRatio,
      },
    });
  }

  console.log('✅ Global scores recalculated');
}

async function main() {
  try {
    await importRealData();
    console.log('\n🎉 SUCCESS! Real data is now in your database.');
    console.log('\nYou can now test your app with real data!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();