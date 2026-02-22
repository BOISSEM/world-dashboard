import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Starting seed with 100 countries...');

  // Nettoyer
  await prisma.computedScore.deleteMany();
  await prisma.countryIndicatorValue.deleteMany();
  await prisma.weightProfile.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.country.deleteMany();

  // 100 pays
  const countries = [
    // Europe (40 pays)
    { iso3: 'NOR', name: 'Norway', region: 'Europe' },
    { iso3: 'SWE', name: 'Sweden', region: 'Europe' },
    { iso3: 'CHE', name: 'Switzerland', region: 'Europe' },
    { iso3: 'DNK', name: 'Denmark', region: 'Europe' },
    { iso3: 'FIN', name: 'Finland', region: 'Europe' },
    { iso3: 'NLD', name: 'Netherlands', region: 'Europe' },
    { iso3: 'DEU', name: 'Germany', region: 'Europe' },
    { iso3: 'GBR', name: 'United Kingdom', region: 'Europe' },
    { iso3: 'FRA', name: 'France', region: 'Europe' },
    { iso3: 'ITA', name: 'Italy', region: 'Europe' },
    { iso3: 'ESP', name: 'Spain', region: 'Europe' },
    { iso3: 'AUT', name: 'Austria', region: 'Europe' },
    { iso3: 'BEL', name: 'Belgium', region: 'Europe' },
    { iso3: 'IRL', name: 'Ireland', region: 'Europe' },
    { iso3: 'LUX', name: 'Luxembourg', region: 'Europe' },
    { iso3: 'ISL', name: 'Iceland', region: 'Europe' },
    { iso3: 'PRT', name: 'Portugal', region: 'Europe' },
    { iso3: 'GRC', name: 'Greece', region: 'Europe' },
    { iso3: 'POL', name: 'Poland', region: 'Europe' },
    { iso3: 'CZE', name: 'Czech Republic', region: 'Europe' },
    { iso3: 'HUN', name: 'Hungary', region: 'Europe' },
    { iso3: 'ROU', name: 'Romania', region: 'Europe' },
    { iso3: 'BGR', name: 'Bulgaria', region: 'Europe' },
    { iso3: 'HRV', name: 'Croatia', region: 'Europe' },
    { iso3: 'SVK', name: 'Slovakia', region: 'Europe' },
    { iso3: 'SVN', name: 'Slovenia', region: 'Europe' },
    { iso3: 'LTU', name: 'Lithuania', region: 'Europe' },
    { iso3: 'LVA', name: 'Latvia', region: 'Europe' },
    { iso3: 'EST', name: 'Estonia', region: 'Europe' },
    { iso3: 'SRB', name: 'Serbia', region: 'Europe' },
    { iso3: 'UKR', name: 'Ukraine', region: 'Europe' },
    { iso3: 'BLR', name: 'Belarus', region: 'Europe' },
    { iso3: 'MDA', name: 'Moldova', region: 'Europe' },
    { iso3: 'ALB', name: 'Albania', region: 'Europe' },
    { iso3: 'MKD', name: 'North Macedonia', region: 'Europe' },
    { iso3: 'BIH', name: 'Bosnia and Herzegovina', region: 'Europe' },
    { iso3: 'MNE', name: 'Montenegro', region: 'Europe' },
    { iso3: 'CYP', name: 'Cyprus', region: 'Europe' },
    { iso3: 'MLT', name: 'Malta', region: 'Europe' },
    { iso3: 'RUS', name: 'Russia', region: 'Europe' },

    // Americas (25 pays)
    { iso3: 'USA', name: 'United States', region: 'Americas' },
    { iso3: 'CAN', name: 'Canada', region: 'Americas' },
    { iso3: 'MEX', name: 'Mexico', region: 'Americas' },
    { iso3: 'BRA', name: 'Brazil', region: 'Americas' },
    { iso3: 'ARG', name: 'Argentina', region: 'Americas' },
    { iso3: 'CHL', name: 'Chile', region: 'Americas' },
    { iso3: 'COL', name: 'Colombia', region: 'Americas' },
    { iso3: 'PER', name: 'Peru', region: 'Americas' },
    { iso3: 'VEN', name: 'Venezuela', region: 'Americas' },
    { iso3: 'ECU', name: 'Ecuador', region: 'Americas' },
    { iso3: 'BOL', name: 'Bolivia', region: 'Americas' },
    { iso3: 'PRY', name: 'Paraguay', region: 'Americas' },
    { iso3: 'URY', name: 'Uruguay', region: 'Americas' },
    { iso3: 'CRI', name: 'Costa Rica', region: 'Americas' },
    { iso3: 'PAN', name: 'Panama', region: 'Americas' },
    { iso3: 'GTM', name: 'Guatemala', region: 'Americas' },
    { iso3: 'HND', name: 'Honduras', region: 'Americas' },
    { iso3: 'NIC', name: 'Nicaragua', region: 'Americas' },
    { iso3: 'SLV', name: 'El Salvador', region: 'Americas' },
    { iso3: 'CUB', name: 'Cuba', region: 'Americas' },
    { iso3: 'DOM', name: 'Dominican Republic', region: 'Americas' },
    { iso3: 'JAM', name: 'Jamaica', region: 'Americas' },
    { iso3: 'TTO', name: 'Trinidad and Tobago', region: 'Americas' },
    { iso3: 'BHS', name: 'Bahamas', region: 'Americas' },
    { iso3: 'BRB', name: 'Barbados', region: 'Americas' },

    // Asia (25 pays)
    { iso3: 'CHN', name: 'China', region: 'Asia' },
    { iso3: 'IND', name: 'India', region: 'Asia' },
    { iso3: 'JPN', name: 'Japan', region: 'Asia' },
    { iso3: 'KOR', name: 'South Korea', region: 'Asia' },
    { iso3: 'IDN', name: 'Indonesia', region: 'Asia' },
    { iso3: 'THA', name: 'Thailand', region: 'Asia' },
    { iso3: 'VNM', name: 'Vietnam', region: 'Asia' },
    { iso3: 'PHL', name: 'Philippines', region: 'Asia' },
    { iso3: 'MYS', name: 'Malaysia', region: 'Asia' },
    { iso3: 'SGP', name: 'Singapore', region: 'Asia' },
    { iso3: 'PAK', name: 'Pakistan', region: 'Asia' },
    { iso3: 'BGD', name: 'Bangladesh', region: 'Asia' },
    { iso3: 'IRN', name: 'Iran', region: 'Asia' },
    { iso3: 'IRQ', name: 'Iraq', region: 'Asia' },
    { iso3: 'SAU', name: 'Saudi Arabia', region: 'Asia' },
    { iso3: 'ARE', name: 'United Arab Emirates', region: 'Asia' },
    { iso3: 'ISR', name: 'Israel', region: 'Asia' },
    { iso3: 'TUR', name: 'Turkey', region: 'Asia' },
    { iso3: 'KAZ', name: 'Kazakhstan', region: 'Asia' },
    { iso3: 'UZB', name: 'Uzbekistan', region: 'Asia' },
    { iso3: 'NPL', name: 'Nepal', region: 'Asia' },
    { iso3: 'LKA', name: 'Sri Lanka', region: 'Asia' },
    { iso3: 'MMR', name: 'Myanmar', region: 'Asia' },
    { iso3: 'KHM', name: 'Cambodia', region: 'Asia' },
    { iso3: 'LAO', name: 'Laos', region: 'Asia' },

    // Africa (8 pays)
    { iso3: 'ZAF', name: 'South Africa', region: 'Africa' },
    { iso3: 'EGY', name: 'Egypt', region: 'Africa' },
    { iso3: 'NGA', name: 'Nigeria', region: 'Africa' },
    { iso3: 'KEN', name: 'Kenya', region: 'Africa' },
    { iso3: 'ETH', name: 'Ethiopia', region: 'Africa' },
    { iso3: 'GHA', name: 'Ghana', region: 'Africa' },
    { iso3: 'MAR', name: 'Morocco', region: 'Africa' },
    { iso3: 'TUN', name: 'Tunisia', region: 'Africa' },

    // Oceania (2 pays)
    { iso3: 'AUS', name: 'Australia', region: 'Oceania' },
    { iso3: 'NZL', name: 'New Zealand', region: 'Oceania' },
  ];

  for (const country of countries) {
    await prisma.country.create({ data: country });
  }

  console.log(`✅ ${countries.length} pays créés`);

  // 8 indicateurs
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

  console.log(`✅ ${indicators.length} indicateurs créés`);

  // Fonction pour générer des données réalistes selon le niveau de développement
  function generateCountryData(iso3: string, region: string) {
    // Définir le niveau de développement
    const highDev = ['NOR', 'SWE', 'CHE', 'DNK', 'FIN', 'NLD', 'DEU', 'GBR', 'FRA', 'AUT', 'BEL', 'IRL', 'LUX', 'ISL', 'CAN', 'USA', 'AUS', 'NZL', 'JPN', 'KOR', 'SGP'];
    const mediumDev = ['ITA', 'ESP', 'PRT', 'GRC', 'POL', 'CZE', 'CHL', 'URY', 'ARG', 'CRI', 'MYS', 'THA', 'CHN', 'TUR', 'MEX', 'BRA', 'ZAF', 'RUS'];
    const lowDev = ['IND', 'PAK', 'BGD', 'NGA', 'ETH', 'KEN', 'GHA', 'VNM', 'PHL', 'IDN', 'EGY', 'MAR', 'TUN'];

    let baseFreedom, baseStability, baseCorruption, baseGDP, baseLife, baseEducation, basePress, baseGender;

    if (highDev.includes(iso3)) {
      baseFreedom = 85 + Math.random() * 15;
      baseStability = 0.8 + Math.random() * 1.2;
      baseCorruption = 1.0 + Math.random() * 1.0;
      baseGDP = 40000 + Math.random() * 45000;
      baseLife = 78 + Math.random() * 7;
      baseEducation = 0.85 + Math.random() * 0.15;
      basePress = Math.random() * 25;
      baseGender = 0.8 + Math.random() * 0.15;
    } else if (mediumDev.includes(iso3)) {
      baseFreedom = 50 + Math.random() * 35;
      baseStability = -0.3 + Math.random() * 1.0;
      baseCorruption = -0.3 + Math.random() * 1.0;
      baseGDP = 8000 + Math.random() * 32000;
      baseLife = 70 + Math.random() * 12;
      baseEducation = 0.65 + Math.random() * 0.25;
      basePress = 25 + Math.random() * 75;
      baseGender = 0.65 + Math.random() * 0.25;
    } else {
      baseFreedom = 20 + Math.random() * 50;
      baseStability = -1.5 + Math.random() * 1.5;
      baseCorruption = -1.5 + Math.random() * 1.0;
      baseGDP = 1000 + Math.random() * 9000;
      baseLife = 60 + Math.random() * 15;
      baseEducation = 0.4 + Math.random() * 0.35;
      basePress = 50 + Math.random() * 80;
      baseGender = 0.45 + Math.random() * 0.35;
    }

    return {
      freedom_score: Math.round(baseFreedom * 10) / 10,
      wgi_political_stability: Math.round(baseStability * 100) / 100,
      wgi_control_corruption: Math.round(baseCorruption * 100) / 100,
      gdp_per_capita: Math.round(baseGDP),
      life_expectancy: Math.round(baseLife * 10) / 10,
      education_index: Math.round(baseEducation * 100) / 100,
      press_freedom: Math.round(basePress),
      gender_equality: Math.round(baseGender * 100) / 100,
    };
  }

  const year = 2023;

  // Générer les données pour chaque pays
  for (const country of countries) {
    const values = generateCountryData(country.iso3, country.region);

    for (const [indicatorId, rawValue] of Object.entries(values)) {
      const indicator = indicators.find((i) => i.id === indicatorId)!;
      let valueNorm: number;

      if (indicatorId === 'freedom_score') {
        valueNorm = rawValue;
      } else if (indicatorId.startsWith('wgi_')) {
        valueNorm = ((rawValue + 2.5) / 5.0) * 100;
      } else if (indicatorId === 'press_freedom') {
        valueNorm = 100 - (rawValue / 180) * 100;
      } else {
        valueNorm = ((rawValue - indicator.scaleMin) / (indicator.scaleMax - indicator.scaleMin)) * 100;
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

  console.log('✅ Données générées pour tous les pays');

  // Poids
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
  for (const country of countries) {
    const values = await prisma.countryIndicatorValue.findMany({
      where: { iso3: country.iso3, year },
    });

    let weightedSum = 0;
    let totalWeight = 0;

    for (const value of values) {
      const weight = defaultWeights[value.indicatorId as keyof typeof defaultWeights] || 0;
      weightedSum += value.valueNorm * weight;
      totalWeight += weight;
    }

    const coverageRatio = totalWeight / Object.values(defaultWeights).reduce((a, b) => a + b, 0);
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

  console.log('✅ Scores calculés');
  console.log(`\n🎉 TERMINÉ! ${countries.length} pays avec ${indicators.length} indicateurs!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });