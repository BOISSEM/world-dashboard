import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Nettoyer
  await prisma.computedScore.deleteMany();
  await prisma.countryIndicatorValue.deleteMany();
  await prisma.weightProfile.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.country.deleteMany();

  // 20 pays au lieu de 5
  const countries = [
    { iso3: 'USA', name: 'United States', region: 'Americas' },
    { iso3: 'GBR', name: 'United Kingdom', region: 'Europe' },
    { iso3: 'DEU', name: 'Germany', region: 'Europe' },
    { iso3: 'JPN', name: 'Japan', region: 'Asia' },
    { iso3: 'BRA', name: 'Brazil', region: 'Americas' },
    { iso3: 'FRA', name: 'France', region: 'Europe' },
    { iso3: 'ITA', name: 'Italy', region: 'Europe' },
    { iso3: 'CAN', name: 'Canada', region: 'Americas' },
    { iso3: 'AUS', name: 'Australia', region: 'Oceania' },
    { iso3: 'ESP', name: 'Spain', region: 'Europe' },
    { iso3: 'CHN', name: 'China', region: 'Asia' },
    { iso3: 'IND', name: 'India', region: 'Asia' },
    { iso3: 'MEX', name: 'Mexico', region: 'Americas' },
    { iso3: 'ZAF', name: 'South Africa', region: 'Africa' },
    { iso3: 'KOR', name: 'South Korea', region: 'Asia' },
    { iso3: 'NOR', name: 'Norway', region: 'Europe' },
    { iso3: 'SWE', name: 'Sweden', region: 'Europe' },
    { iso3: 'CHE', name: 'Switzerland', region: 'Europe' },
    { iso3: 'NLD', name: 'Netherlands', region: 'Europe' },
    { iso3: 'SGP', name: 'Singapore', region: 'Asia' },
  ];

  for (const country of countries) {
    await prisma.country.create({ data: country });
  }

  // 8 indicateurs au lieu de 5
  const indicators = [
    {
      id: 'freedom_score',
      name: 'Freedom Score',
      theme: 'Democracy & Rights',
      scaleMin: 0,
      scaleMax: 100,
      higherIsBetter: true,
      sourceName: 'Freedom House',
      sourceUrl: 'https://freedomhouse.org',
    },
    {
      id: 'wgi_political_stability',
      name: 'Political Stability',
      theme: 'Governance',
      scaleMin: -2.5,
      scaleMax: 2.5,
      higherIsBetter: true,
      sourceName: 'World Bank WGI',
      sourceUrl: 'https://info.worldbank.org/governance/wgi/',
    },
    {
      id: 'wgi_control_corruption',
      name: 'Control of Corruption',
      theme: 'Governance',
      scaleMin: -2.5,
      scaleMax: 2.5,
      higherIsBetter: true,
      sourceName: 'World Bank WGI',
      sourceUrl: 'https://info.worldbank.org/governance/wgi/',
    },
    {
      id: 'gdp_per_capita',
      name: 'GDP per Capita',
      theme: 'Economy',
      scaleMin: 0,
      scaleMax: 100000,
      higherIsBetter: true,
      sourceName: 'World Bank',
      sourceUrl: 'https://data.worldbank.org',
    },
    {
      id: 'life_expectancy',
      name: 'Life Expectancy',
      theme: 'Health',
      scaleMin: 50,
      scaleMax: 90,
      higherIsBetter: true,
      sourceName: 'WHO',
      sourceUrl: 'https://www.who.int',
    },
    {
      id: 'education_index',
      name: 'Education Index',
      theme: 'Education',
      scaleMin: 0,
      scaleMax: 1,
      higherIsBetter: true,
      sourceName: 'UNDP',
      sourceUrl: 'https://hdr.undp.org',
    },
    {
      id: 'press_freedom',
      name: 'Press Freedom Index',
      theme: 'Democracy & Rights',
      scaleMin: 0,
      scaleMax: 100,
      higherIsBetter: false,
      sourceName: 'Reporters Without Borders',
      sourceUrl: 'https://rsf.org',
    },
    {
      id: 'gender_equality',
      name: 'Gender Equality Index',
      theme: 'Social',
      scaleMin: 0,
      scaleMax: 1,
      higherIsBetter: true,
      sourceName: 'UNDP',
      sourceUrl: 'https://hdr.undp.org',
    },
  ];

  for (const indicator of indicators) {
    await prisma.indicator.create({ data: indicator });
  }

  // Données pour les 20 pays
  const countryData = [
    {
      iso3: 'USA',
      values: {
        freedom_score: 83,
        wgi_political_stability: 0.5,
        wgi_control_corruption: 1.2,
        gdp_per_capita: 65000,
        life_expectancy: 78.5,
        education_index: 0.9,
        press_freedom: 45,
        gender_equality: 0.85,
      },
    },
    {
      iso3: 'GBR',
      values: {
        freedom_score: 93,
        wgi_political_stability: 0.8,
        wgi_control_corruption: 1.5,
        gdp_per_capita: 45000,
        life_expectancy: 81.2,
        education_index: 0.92,
        press_freedom: 33,
        gender_equality: 0.88,
      },
    },
    {
      iso3: 'DEU',
      values: {
        freedom_score: 94,
        wgi_political_stability: 0.9,
        wgi_control_corruption: 1.8,
        gdp_per_capita: 48000,
        life_expectancy: 81.0,
        education_index: 0.94,
        press_freedom: 16,
        gender_equality: 0.89,
      },
    },
    {
      iso3: 'JPN',
      values: {
        freedom_score: 96,
        wgi_political_stability: 1.0,
        wgi_control_corruption: 1.4,
        gdp_per_capita: 42000,
        life_expectancy: 84.5,
        education_index: 0.91,
        press_freedom: 68,
        gender_equality: 0.65,
      },
    },
    {
      iso3: 'BRA',
      values: {
        freedom_score: 73,
        wgi_political_stability: -0.3,
        wgi_control_corruption: -0.2,
        gdp_per_capita: 9000,
        life_expectancy: 75.8,
        education_index: 0.76,
        press_freedom: 92,
        gender_equality: 0.74,
      },
    },
    {
      iso3: 'FRA',
      values: {
        freedom_score: 90,
        wgi_political_stability: 0.3,
        wgi_control_corruption: 1.3,
        gdp_per_capita: 43000,
        life_expectancy: 82.5,
        education_index: 0.89,
        press_freedom: 24,
        gender_equality: 0.86,
      },
    },
    {
      iso3: 'ITA',
      values: {
        freedom_score: 90,
        wgi_political_stability: 0.2,
        wgi_control_corruption: 0.1,
        gdp_per_capita: 35000,
        life_expectancy: 83.2,
        education_index: 0.85,
        press_freedom: 41,
        gender_equality: 0.81,
      },
    },
    {
      iso3: 'CAN',
      values: {
        freedom_score: 98,
        wgi_political_stability: 1.1,
        wgi_control_corruption: 1.9,
        gdp_per_capita: 48000,
        life_expectancy: 82.0,
        education_index: 0.93,
        press_freedom: 14,
        gender_equality: 0.91,
      },
    },
    {
      iso3: 'AUS',
      values: {
        freedom_score: 95,
        wgi_political_stability: 0.9,
        wgi_control_corruption: 1.7,
        gdp_per_capita: 52000,
        life_expectancy: 83.0,
        education_index: 0.94,
        press_freedom: 27,
        gender_equality: 0.87,
      },
    },
    {
      iso3: 'ESP',
      values: {
        freedom_score: 91,
        wgi_political_stability: 0.1,
        wgi_control_corruption: 0.7,
        gdp_per_capita: 30000,
        life_expectancy: 83.5,
        education_index: 0.88,
        press_freedom: 32,
        gender_equality: 0.84,
      },
    },
    {
      iso3: 'CHN',
      values: {
        freedom_score: 9,
        wgi_political_stability: 0.2,
        wgi_control_corruption: -0.3,
        gdp_per_capita: 12000,
        life_expectancy: 77.0,
        education_index: 0.76,
        press_freedom: 179,
        gender_equality: 0.71,
      },
    },
    {
      iso3: 'IND',
      values: {
        freedom_score: 66,
        wgi_political_stability: -0.9,
        wgi_control_corruption: -0.4,
        gdp_per_capita: 2200,
        life_expectancy: 69.5,
        education_index: 0.65,
        press_freedom: 161,
        gender_equality: 0.63,
      },
    },
    {
      iso3: 'MEX',
      values: {
        freedom_score: 60,
        wgi_political_stability: -0.7,
        wgi_control_corruption: -0.6,
        gdp_per_capita: 10000,
        life_expectancy: 75.0,
        education_index: 0.76,
        press_freedom: 143,
        gender_equality: 0.77,
      },
    },
    {
      iso3: 'ZAF',
      values: {
        freedom_score: 79,
        wgi_political_stability: -0.2,
        wgi_control_corruption: -0.1,
        gdp_per_capita: 6500,
        life_expectancy: 64.0,
        education_index: 0.72,
        press_freedom: 31,
        gender_equality: 0.78,
      },
    },
    {
      iso3: 'KOR',
      values: {
        freedom_score: 83,
        wgi_political_stability: 0.5,
        wgi_control_corruption: 0.7,
        gdp_per_capita: 34000,
        life_expectancy: 83.5,
        education_index: 0.92,
        press_freedom: 43,
        gender_equality: 0.68,
      },
    },
    {
      iso3: 'NOR',
      values: {
        freedom_score: 100,
        wgi_political_stability: 1.4,
        wgi_control_corruption: 2.2,
        gdp_per_capita: 75000,
        life_expectancy: 82.5,
        education_index: 0.96,
        press_freedom: 1,
        gender_equality: 0.95,
      },
    },
    {
      iso3: 'SWE',
      values: {
        freedom_score: 100,
        wgi_political_stability: 1.2,
        wgi_control_corruption: 2.1,
        gdp_per_capita: 55000,
        life_expectancy: 82.8,
        education_index: 0.95,
        press_freedom: 3,
        gender_equality: 0.94,
      },
    },
    {
      iso3: 'CHE',
      values: {
        freedom_score: 96,
        wgi_political_stability: 1.3,
        wgi_control_corruption: 2.0,
        gdp_per_capita: 85000,
        life_expectancy: 83.7,
        education_index: 0.93,
        press_freedom: 10,
        gender_equality: 0.87,
      },
    },
    {
      iso3: 'NLD',
      values: {
        freedom_score: 99,
        wgi_political_stability: 1.0,
        wgi_control_corruption: 1.9,
        gdp_per_capita: 52000,
        life_expectancy: 82.0,
        education_index: 0.94,
        press_freedom: 6,
        gender_equality: 0.90,
      },
    },
    {
      iso3: 'SGP',
      values: {
        freedom_score: 48,
        wgi_political_stability: 1.2,
        wgi_control_corruption: 2.1,
        gdp_per_capita: 65000,
        life_expectancy: 83.5,
        education_index: 0.89,
        press_freedom: 140,
        gender_equality: 0.73,
      },
    },
  ];

  const year = 2023;

  for (const country of countryData) {
    for (const [indicatorId, rawValue] of Object.entries(country.values)) {
      const indicator = indicators.find((i) => i.id === indicatorId)!;
      let valueNorm: number;

      if (indicatorId === 'freedom_score') {
        valueNorm = rawValue;
      } else if (indicatorId.startsWith('wgi_')) {
        valueNorm = ((rawValue + 2.5) / 5.0) * 100;
      } else if (indicatorId === 'press_freedom') {
        // Inverser car plus petit = mieux
        valueNorm = 100 - (rawValue / 180) * 100;
      } else {
        valueNorm =
          ((rawValue - indicator.scaleMin) /
            (indicator.scaleMax - indicator.scaleMin)) *
          100;
      }

      valueNorm = Math.max(0, Math.min(100, valueNorm));

      await prisma.countryIndicatorValue.create({
        data: {
          iso3: country.iso3,
          indicatorId,
          year,
          value: rawValue,
          valueNorm,
        },
      });
    }
  }

  // Poids par défaut
  const defaultWeights = {
    freedom_score: 0.2,
    wgi_political_stability: 0.15,
    wgi_control_corruption: 0.15,
    gdp_per_capita: 0.15,
    life_expectancy: 0.1,
    education_index: 0.1,
    press_freedom: 0.075,
    gender_equality: 0.075,
  };

  await prisma.weightProfile.create({
    data: {
      id: 'default',
      name: 'Default Profile',
      weights: JSON.stringify(defaultWeights),
    },
  });

  // Calculer les scores
  for (const country of countryData) {
    const values = await prisma.countryIndicatorValue.findMany({
      where: { iso3: country.iso3, year },
    });

    let weightedSum = 0;
    let totalWeight = 0;

    for (const value of values) {
      const weight =
        defaultWeights[value.indicatorId as keyof typeof defaultWeights] || 0;
      weightedSum += value.valueNorm * weight;
      totalWeight += weight;
    }

    const coverageRatio =
      totalWeight / Object.values(defaultWeights).reduce((a, b) => a + b, 0);
    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;

    await prisma.computedScore.create({
      data: {
        iso3: country.iso3,
        profileId: 'default',
        year,
        score,
        coverageRatio,
      },
    });
  }

  console.log('✅ Seed terminé avec succès!');
  console.log(`📊 ${countries.length} pays ajoutés`);
  console.log(`📈 ${indicators.length} indicateurs ajoutés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });