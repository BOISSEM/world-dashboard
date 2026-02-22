import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Starting seed with ALL 195 countries...');

  // Nettoyer
  await prisma.computedScore.deleteMany();
  await prisma.countryIndicatorValue.deleteMany();
  await prisma.weightProfile.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.country.deleteMany();

  // TOUS les 195 pays reconnus par l'ONU
  const countries = [
    // EUROPE (44 pays)
    { iso3: 'ALB', name: 'Albania', region: 'Europe' },
    { iso3: 'AND', name: 'Andorra', region: 'Europe' },
    { iso3: 'AUT', name: 'Austria', region: 'Europe' },
    { iso3: 'BLR', name: 'Belarus', region: 'Europe' },
    { iso3: 'BEL', name: 'Belgium', region: 'Europe' },
    { iso3: 'BIH', name: 'Bosnia and Herzegovina', region: 'Europe' },
    { iso3: 'BGR', name: 'Bulgaria', region: 'Europe' },
    { iso3: 'HRV', name: 'Croatia', region: 'Europe' },
    { iso3: 'CYP', name: 'Cyprus', region: 'Europe' },
    { iso3: 'CZE', name: 'Czech Republic', region: 'Europe' },
    { iso3: 'DNK', name: 'Denmark', region: 'Europe' },
    { iso3: 'EST', name: 'Estonia', region: 'Europe' },
    { iso3: 'FIN', name: 'Finland', region: 'Europe' },
    { iso3: 'FRA', name: 'France', region: 'Europe' },
    { iso3: 'DEU', name: 'Germany', region: 'Europe' },
    { iso3: 'GRC', name: 'Greece', region: 'Europe' },
    { iso3: 'HUN', name: 'Hungary', region: 'Europe' },
    { iso3: 'ISL', name: 'Iceland', region: 'Europe' },
    { iso3: 'IRL', name: 'Ireland', region: 'Europe' },
    { iso3: 'ITA', name: 'Italy', region: 'Europe' },
    { iso3: 'XKX', name: 'Kosovo', region: 'Europe' },
    { iso3: 'LVA', name: 'Latvia', region: 'Europe' },
    { iso3: 'LIE', name: 'Liechtenstein', region: 'Europe' },
    { iso3: 'LTU', name: 'Lithuania', region: 'Europe' },
    { iso3: 'LUX', name: 'Luxembourg', region: 'Europe' },
    { iso3: 'MLT', name: 'Malta', region: 'Europe' },
    { iso3: 'MDA', name: 'Moldova', region: 'Europe' },
    { iso3: 'MCO', name: 'Monaco', region: 'Europe' },
    { iso3: 'MNE', name: 'Montenegro', region: 'Europe' },
    { iso3: 'NLD', name: 'Netherlands', region: 'Europe' },
    { iso3: 'MKD', name: 'North Macedonia', region: 'Europe' },
    { iso3: 'NOR', name: 'Norway', region: 'Europe' },
    { iso3: 'POL', name: 'Poland', region: 'Europe' },
    { iso3: 'PRT', name: 'Portugal', region: 'Europe' },
    { iso3: 'ROU', name: 'Romania', region: 'Europe' },
    { iso3: 'RUS', name: 'Russia', region: 'Europe' },
    { iso3: 'SMR', name: 'San Marino', region: 'Europe' },
    { iso3: 'SRB', name: 'Serbia', region: 'Europe' },
    { iso3: 'SVK', name: 'Slovakia', region: 'Europe' },
    { iso3: 'SVN', name: 'Slovenia', region: 'Europe' },
    { iso3: 'ESP', name: 'Spain', region: 'Europe' },
    { iso3: 'SWE', name: 'Sweden', region: 'Europe' },
    { iso3: 'CHE', name: 'Switzerland', region: 'Europe' },
    { iso3: 'UKR', name: 'Ukraine', region: 'Europe' },
    { iso3: 'GBR', name: 'United Kingdom', region: 'Europe' },
    { iso3: 'VAT', name: 'Vatican City', region: 'Europe' },

    // ASIE (48 pays)
    { iso3: 'AFG', name: 'Afghanistan', region: 'Asia' },
    { iso3: 'ARM', name: 'Armenia', region: 'Asia' },
    { iso3: 'AZE', name: 'Azerbaijan', region: 'Asia' },
    { iso3: 'BHR', name: 'Bahrain', region: 'Asia' },
    { iso3: 'BGD', name: 'Bangladesh', region: 'Asia' },
    { iso3: 'BTN', name: 'Bhutan', region: 'Asia' },
    { iso3: 'BRN', name: 'Brunei', region: 'Asia' },
    { iso3: 'KHM', name: 'Cambodia', region: 'Asia' },
    { iso3: 'CHN', name: 'China', region: 'Asia' },
    { iso3: 'GEO', name: 'Georgia', region: 'Asia' },
    { iso3: 'IND', name: 'India', region: 'Asia' },
    { iso3: 'IDN', name: 'Indonesia', region: 'Asia' },
    { iso3: 'IRN', name: 'Iran', region: 'Asia' },
    { iso3: 'IRQ', name: 'Iraq', region: 'Asia' },
    { iso3: 'ISR', name: 'Israel', region: 'Asia' },
    { iso3: 'JPN', name: 'Japan', region: 'Asia' },
    { iso3: 'JOR', name: 'Jordan', region: 'Asia' },
    { iso3: 'KAZ', name: 'Kazakhstan', region: 'Asia' },
    { iso3: 'KWT', name: 'Kuwait', region: 'Asia' },
    { iso3: 'KGZ', name: 'Kyrgyzstan', region: 'Asia' },
    { iso3: 'LAO', name: 'Laos', region: 'Asia' },
    { iso3: 'LBN', name: 'Lebanon', region: 'Asia' },
    { iso3: 'MYS', name: 'Malaysia', region: 'Asia' },
    { iso3: 'MDV', name: 'Maldives', region: 'Asia' },
    { iso3: 'MNG', name: 'Mongolia', region: 'Asia' },
    { iso3: 'MMR', name: 'Myanmar', region: 'Asia' },
    { iso3: 'NPL', name: 'Nepal', region: 'Asia' },
    { iso3: 'PRK', name: 'North Korea', region: 'Asia' },
    { iso3: 'OMN', name: 'Oman', region: 'Asia' },
    { iso3: 'PAK', name: 'Pakistan', region: 'Asia' },
    { iso3: 'PSE', name: 'Palestine', region: 'Asia' },
    { iso3: 'PHL', name: 'Philippines', region: 'Asia' },
    { iso3: 'QAT', name: 'Qatar', region: 'Asia' },
    { iso3: 'SAU', name: 'Saudi Arabia', region: 'Asia' },
    { iso3: 'SGP', name: 'Singapore', region: 'Asia' },
    { iso3: 'KOR', name: 'South Korea', region: 'Asia' },
    { iso3: 'LKA', name: 'Sri Lanka', region: 'Asia' },
    { iso3: 'SYR', name: 'Syria', region: 'Asia' },
    { iso3: 'TWN', name: 'Taiwan', region: 'Asia' },
    { iso3: 'TJK', name: 'Tajikistan', region: 'Asia' },
    { iso3: 'THA', name: 'Thailand', region: 'Asia' },
    { iso3: 'TLS', name: 'Timor-Leste', region: 'Asia' },
    { iso3: 'TUR', name: 'Turkey', region: 'Asia' },
    { iso3: 'TKM', name: 'Turkmenistan', region: 'Asia' },
    { iso3: 'ARE', name: 'United Arab Emirates', region: 'Asia' },
    { iso3: 'UZB', name: 'Uzbekistan', region: 'Asia' },
    { iso3: 'VNM', name: 'Vietnam', region: 'Asia' },
    { iso3: 'YEM', name: 'Yemen', region: 'Asia' },

    // AFRIQUE (54 pays)
    { iso3: 'DZA', name: 'Algeria', region: 'Africa' },
    { iso3: 'AGO', name: 'Angola', region: 'Africa' },
    { iso3: 'BEN', name: 'Benin', region: 'Africa' },
    { iso3: 'BWA', name: 'Botswana', region: 'Africa' },
    { iso3: 'BFA', name: 'Burkina Faso', region: 'Africa' },
    { iso3: 'BDI', name: 'Burundi', region: 'Africa' },
    { iso3: 'CPV', name: 'Cape Verde', region: 'Africa' },
    { iso3: 'CMR', name: 'Cameroon', region: 'Africa' },
    { iso3: 'CAF', name: 'Central African Republic', region: 'Africa' },
    { iso3: 'TCD', name: 'Chad', region: 'Africa' },
    { iso3: 'COM', name: 'Comoros', region: 'Africa' },
    { iso3: 'COG', name: 'Congo', region: 'Africa' },
    { iso3: 'COD', name: 'DR Congo', region: 'Africa' },
    { iso3: 'CIV', name: "Côte d'Ivoire", region: 'Africa' },
    { iso3: 'DJI', name: 'Djibouti', region: 'Africa' },
    { iso3: 'EGY', name: 'Egypt', region: 'Africa' },
    { iso3: 'GNQ', name: 'Equatorial Guinea', region: 'Africa' },
    { iso3: 'ERI', name: 'Eritrea', region: 'Africa' },
    { iso3: 'SWZ', name: 'Eswatini', region: 'Africa' },
    { iso3: 'ETH', name: 'Ethiopia', region: 'Africa' },
    { iso3: 'GAB', name: 'Gabon', region: 'Africa' },
    { iso3: 'GMB', name: 'Gambia', region: 'Africa' },
    { iso3: 'GHA', name: 'Ghana', region: 'Africa' },
    { iso3: 'GIN', name: 'Guinea', region: 'Africa' },
    { iso3: 'GNB', name: 'Guinea-Bissau', region: 'Africa' },
    { iso3: 'KEN', name: 'Kenya', region: 'Africa' },
    { iso3: 'LSO', name: 'Lesotho', region: 'Africa' },
    { iso3: 'LBR', name: 'Liberia', region: 'Africa' },
    { iso3: 'LBY', name: 'Libya', region: 'Africa' },
    { iso3: 'MDG', name: 'Madagascar', region: 'Africa' },
    { iso3: 'MWI', name: 'Malawi', region: 'Africa' },
    { iso3: 'MLI', name: 'Mali', region: 'Africa' },
    { iso3: 'MRT', name: 'Mauritania', region: 'Africa' },
    { iso3: 'MUS', name: 'Mauritius', region: 'Africa' },
    { iso3: 'MAR', name: 'Morocco', region: 'Africa' },
    { iso3: 'MOZ', name: 'Mozambique', region: 'Africa' },
    { iso3: 'NAM', name: 'Namibia', region: 'Africa' },
    { iso3: 'NER', name: 'Niger', region: 'Africa' },
    { iso3: 'NGA', name: 'Nigeria', region: 'Africa' },
    { iso3: 'RWA', name: 'Rwanda', region: 'Africa' },
    { iso3: 'STP', name: 'São Tomé and Príncipe', region: 'Africa' },
    { iso3: 'SEN', name: 'Senegal', region: 'Africa' },
    { iso3: 'SYC', name: 'Seychelles', region: 'Africa' },
    { iso3: 'SLE', name: 'Sierra Leone', region: 'Africa' },
    { iso3: 'SOM', name: 'Somalia', region: 'Africa' },
    { iso3: 'ZAF', name: 'South Africa', region: 'Africa' },
    { iso3: 'SSD', name: 'South Sudan', region: 'Africa' },
    { iso3: 'SDN', name: 'Sudan', region: 'Africa' },
    { iso3: 'TZA', name: 'Tanzania', region: 'Africa' },
    { iso3: 'TGO', name: 'Togo', region: 'Africa' },
    { iso3: 'TUN', name: 'Tunisia', region: 'Africa' },
    { iso3: 'UGA', name: 'Uganda', region: 'Africa' },
    { iso3: 'ZMB', name: 'Zambia', region: 'Africa' },
    { iso3: 'ZWE', name: 'Zimbabwe', region: 'Africa' },

    // AMÉRIQUES (35 pays)
    { iso3: 'ATG', name: 'Antigua and Barbuda', region: 'Americas' },
    { iso3: 'ARG', name: 'Argentina', region: 'Americas' },
    { iso3: 'BHS', name: 'Bahamas', region: 'Americas' },
    { iso3: 'BRB', name: 'Barbados', region: 'Americas' },
    { iso3: 'BLZ', name: 'Belize', region: 'Americas' },
    { iso3: 'BOL', name: 'Bolivia', region: 'Americas' },
    { iso3: 'BRA', name: 'Brazil', region: 'Americas' },
    { iso3: 'CAN', name: 'Canada', region: 'Americas' },
    { iso3: 'CHL', name: 'Chile', region: 'Americas' },
    { iso3: 'COL', name: 'Colombia', region: 'Americas' },
    { iso3: 'CRI', name: 'Costa Rica', region: 'Americas' },
    { iso3: 'CUB', name: 'Cuba', region: 'Americas' },
    { iso3: 'DMA', name: 'Dominica', region: 'Americas' },
    { iso3: 'DOM', name: 'Dominican Republic', region: 'Americas' },
    { iso3: 'ECU', name: 'Ecuador', region: 'Americas' },
    { iso3: 'SLV', name: 'El Salvador', region: 'Americas' },
    { iso3: 'GRD', name: 'Grenada', region: 'Americas' },
    { iso3: 'GTM', name: 'Guatemala', region: 'Americas' },
    { iso3: 'GUY', name: 'Guyana', region: 'Americas' },
    { iso3: 'HTI', name: 'Haiti', region: 'Americas' },
    { iso3: 'HND', name: 'Honduras', region: 'Americas' },
    { iso3: 'JAM', name: 'Jamaica', region: 'Americas' },
    { iso3: 'MEX', name: 'Mexico', region: 'Americas' },
    { iso3: 'NIC', name: 'Nicaragua', region: 'Americas' },
    { iso3: 'PAN', name: 'Panama', region: 'Americas' },
    { iso3: 'PRY', name: 'Paraguay', region: 'Americas' },
    { iso3: 'PER', name: 'Peru', region: 'Americas' },
    { iso3: 'KNA', name: 'Saint Kitts and Nevis', region: 'Americas' },
    { iso3: 'LCA', name: 'Saint Lucia', region: 'Americas' },
    { iso3: 'VCT', name: 'Saint Vincent and the Grenadines', region: 'Americas' },
    { iso3: 'SUR', name: 'Suriname', region: 'Americas' },
    { iso3: 'TTO', name: 'Trinidad and Tobago', region: 'Americas' },
    { iso3: 'USA', name: 'United States', region: 'Americas' },
    { iso3: 'URY', name: 'Uruguay', region: 'Americas' },
    { iso3: 'VEN', name: 'Venezuela', region: 'Americas' },

    // OCÉANIE (14 pays)
    { iso3: 'AUS', name: 'Australia', region: 'Oceania' },
    { iso3: 'FJI', name: 'Fiji', region: 'Oceania' },
    { iso3: 'KIR', name: 'Kiribati', region: 'Oceania' },
    { iso3: 'MHL', name: 'Marshall Islands', region: 'Oceania' },
    { iso3: 'FSM', name: 'Micronesia', region: 'Oceania' },
    { iso3: 'NRU', name: 'Nauru', region: 'Oceania' },
    { iso3: 'NZL', name: 'New Zealand', region: 'Oceania' },
    { iso3: 'PLW', name: 'Palau', region: 'Oceania' },
    { iso3: 'PNG', name: 'Papua New Guinea', region: 'Oceania' },
    { iso3: 'WSM', name: 'Samoa', region: 'Oceania' },
    { iso3: 'SLB', name: 'Solomon Islands', region: 'Oceania' },
    { iso3: 'TON', name: 'Tonga', region: 'Oceania' },
    { iso3: 'TUV', name: 'Tuvalu', region: 'Oceania' },
    { iso3: 'VUT', name: 'Vanuatu', region: 'Oceania' },
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

  // Fonction pour générer des données réalistes
  function generateCountryData(iso3: string, region: string) {
    // Pays très développés
    const veryHighDev = [
      'NOR', 'CHE', 'ISL', 'DNK', 'SWE', 'NLD', 'FIN', 'IRL', 'DEU', 'AUT',
      'BEL', 'LUX', 'CAN', 'AUS', 'NZL', 'SGP', 'JPN', 'KOR', 'GBR', 'FRA',
      'USA', 'ESP', 'ITA', 'ISR', 'CYP', 'MLT', 'SVN', 'EST'
    ];

    // Pays hautement développés
    const highDev = [
      'PRT', 'GRC', 'CZE', 'POL', 'LTU', 'LVA', 'SVK', 'HUN', 'CHL', 'URY',
      'ARG', 'HRV', 'ROU', 'BGR', 'BRN', 'BHR', 'QAT', 'ARE', 'KWT', 'SAU',
      'MYS', 'TUR', 'RUS', 'BLR', 'KAZ', 'MUS', 'SRB', 'MNE', 'MKD', 'ALB',
      'BIH', 'CRI', 'PAN', 'TTO', 'BRB', 'BHS'
    ];

    // Pays moyennement développés
    const mediumDev = [
      'CHN', 'THA', 'BRA', 'MEX', 'COL', 'PER', 'ECU', 'DOM', 'JAM', 'ZAF',
      'TUN', 'DZA', 'MAR', 'EGY', 'JOR', 'LBN', 'IRN', 'ARM', 'AZE', 'GEO',
      'UKR', 'MDA', 'UZB', 'TJK', 'KGZ', 'TKM', 'MNG', 'VNM', 'PHL', 'IDN',
      'IND', 'LKA', 'BGD', 'PAK', 'BOL', 'PRY', 'GTM', 'SLV', 'HND', 'NIC',
      'NAM', 'BWA', 'GAB', 'GHA', 'KEN', 'FJI', 'WSM', 'TON', 'VUT'
    ];

    // Pays à faible développement
    const lowDev = [
      'AFG', 'NPL', 'MMR', 'KHM', 'LAO', 'BTN', 'PRK', 'SYR', 'IRQ', 'YEM',
      'PSE', 'HTI', 'VEN', 'CUB', 'NGA', 'ETH', 'COD', 'TZA', 'UGA', 'RWA',
      'BDI', 'SOM', 'SSD', 'SDN', 'ERI', 'DJI', 'TCD', 'CAF', 'NER', 'MLI',
      'BFA', 'GIN', 'GNB', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'CMR', 'AGO',
      'MOZ', 'MWI', 'ZMB', 'ZWE', 'LSO', 'SWZ', 'MDG', 'COM', 'STP', 'CPV',
      'GMB', 'SEN', 'MRT', 'PNG', 'SLB', 'VUT', 'KIR', 'TUV', 'NRU', 'PLW',
      'MHL', 'FSM', 'TLS', 'GUY', 'SUR', 'BLZ', 'LBY', 'OMN', 'TWN', 'MNG'
    ];

    let baseFreedom, baseStability, baseCorruption, baseGDP, baseLife, baseEducation, basePress, baseGender;

    if (veryHighDev.includes(iso3)) {
      baseFreedom = 85 + Math.random() * 15;
      baseStability = 0.9 + Math.random() * 1.3;
      baseCorruption = 1.2 + Math.random() * 1.0;
      baseGDP = 45000 + Math.random() * 50000;
      baseLife = 79 + Math.random() * 7;
      baseEducation = 0.88 + Math.random() * 0.12;
      basePress = Math.random() * 20;
      baseGender = 0.82 + Math.random() * 0.15;
    } else if (highDev.includes(iso3)) {
      baseFreedom = 60 + Math.random() * 30;
      baseStability = 0.2 + Math.random() * 1.0;
      baseCorruption = 0.0 + Math.random() * 1.2;
      baseGDP = 12000 + Math.random() * 35000;
      baseLife = 72 + Math.random() * 10;
      baseEducation = 0.70 + Math.random() * 0.22;
      basePress = 20 + Math.random() * 60;
      baseGender = 0.68 + Math.random() * 0.22;
    } else if (mediumDev.includes(iso3)) {
      baseFreedom = 35 + Math.random() * 40;
      baseStability = -0.5 + Math.random() * 1.2;
      baseCorruption = -0.5 + Math.random() * 1.0;
      baseGDP = 3000 + Math.random() * 14000;
      baseLife = 65 + Math.random() * 12;
      baseEducation = 0.55 + Math.random() * 0.25;
      basePress = 40 + Math.random() * 80;
      baseGender = 0.55 + Math.random() * 0.25;
    } else {
      baseFreedom = 10 + Math.random() * 40;
      baseStability = -1.5 + Math.random() * 1.5;
      baseCorruption = -1.5 + Math.random() * 1.0;
      baseGDP = 500 + Math.random() * 4500;
      baseLife = 55 + Math.random() * 15;
      baseEducation = 0.35 + Math.random() * 0.30;
      basePress = 60 + Math.random() * 100;
      baseGender = 0.40 + Math.random() * 0.30;
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

  console.log('⏳ Génération des données pour 195 pays...');
  let progress = 0;

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

    progress++;
    if (progress % 20 === 0) {
      console.log(`   ${progress}/${countries.length} pays traités...`);
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

  console.log('⏳ Calcul des scores...');

  // Calculer les scores
  for (const country of countries) {
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

  console.log('✅ Scores calculés');
  console.log('\n🎉 =======================================');
  console.log(`🌍 TERMINÉ! ${countries.length} pays`);
  console.log(`📊 ${indicators.length} indicateurs`);
  console.log(`📈 ${countries.length * indicators.length} valeurs`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });