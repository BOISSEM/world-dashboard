import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Adding extended indicators...');

  // Supprimer les anciennes données
  await prisma.computedScore.deleteMany();
  await prisma.countryIndicatorValue.deleteMany();
  await prisma.weightProfile.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.country.deleteMany();

  // Les 197 pays (même liste qu'avant)
  const countries = [
    // Europe (46 pays)
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

    // Asie (48 pays)
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

    // Afrique (54 pays)
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

    // Amériques (35 pays)
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

    // Océanie (14 pays)
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
  console.log(`✅ ${countries.length} countries created`);

  // TOUS LES INDICATEURS (30 indicateurs!)
  const indicators = [
    // Gouvernance & Droits (5)
    { id: 'freedom_score', name: 'Freedom Score', theme: 'Democracy & Rights', scaleMin: 0, scaleMax: 100, higherIsBetter: true, sourceName: 'Freedom House', sourceUrl: 'https://freedomhouse.org' },
    { id: 'wgi_political_stability', name: 'Political Stability', theme: 'Governance', scaleMin: -2.5, scaleMax: 2.5, higherIsBetter: true, sourceName: 'World Bank WGI', sourceUrl: 'https://info.worldbank.org/governance/wgi/' },
    { id: 'wgi_control_corruption', name: 'Control of Corruption', theme: 'Governance', scaleMin: -2.5, scaleMax: 2.5, higherIsBetter: true, sourceName: 'World Bank WGI', sourceUrl: 'https://info.worldbank.org/governance/wgi/' },
    { id: 'press_freedom', name: 'Press Freedom Index', theme: 'Democracy & Rights', scaleMin: 0, scaleMax: 100, higherIsBetter: false, sourceName: 'RSF', sourceUrl: 'https://rsf.org' },
    { id: 'gender_equality', name: 'Gender Equality Index', theme: 'Social', scaleMin: 0, scaleMax: 1, higherIsBetter: true, sourceName: 'UNDP', sourceUrl: 'https://hdr.undp.org' },
    
    // Économie (6)
    { id: 'gdp_per_capita', name: 'GDP per Capita', theme: 'Economy', scaleMin: 0, scaleMax: 100000, higherIsBetter: true, sourceName: 'World Bank', sourceUrl: 'https://data.worldbank.org' },
    { id: 'unemployment_rate', name: 'Unemployment Rate', theme: 'Economy', scaleMin: 0, scaleMax: 30, higherIsBetter: false, sourceName: 'ILO', sourceUrl: 'https://www.ilo.org' },
    { id: 'inflation_rate', name: 'Inflation Rate', theme: 'Economy', scaleMin: -5, scaleMax: 20, higherIsBetter: false, sourceName: 'IMF', sourceUrl: 'https://www.imf.org' },
    { id: 'public_debt', name: 'Public Debt (% GDP)', theme: 'Economy', scaleMin: 0, scaleMax: 200, higherIsBetter: false, sourceName: 'IMF', sourceUrl: 'https://www.imf.org' },
    { id: 'economic_competitiveness', name: 'Economic Competitiveness', theme: 'Economy', scaleMin: 0, scaleMax: 100, higherIsBetter: true, sourceName: 'WEF', sourceUrl: 'https://www.weforum.org' },
    { id: 'gini_coefficient', name: 'Gini Coefficient (Inequality)', theme: 'Economy', scaleMin: 20, scaleMax: 70, higherIsBetter: false, sourceName: 'World Bank', sourceUrl: 'https://data.worldbank.org' },
    
    // Santé (4)
    { id: 'life_expectancy', name: 'Life Expectancy', theme: 'Health', scaleMin: 50, scaleMax: 90, higherIsBetter: true, sourceName: 'WHO', sourceUrl: 'https://www.who.int' },
    { id: 'infant_mortality', name: 'Infant Mortality (per 1000)', theme: 'Health', scaleMin: 0, scaleMax: 100, higherIsBetter: false, sourceName: 'WHO', sourceUrl: 'https://www.who.int' },
    { id: 'doctors_per_1000', name: 'Doctors per 1000 people', theme: 'Health', scaleMin: 0, scaleMax: 10, higherIsBetter: true, sourceName: 'WHO', sourceUrl: 'https://www.who.int' },
    { id: 'health_expenditure', name: 'Health Expenditure (% GDP)', theme: 'Health', scaleMin: 0, scaleMax: 20, higherIsBetter: true, sourceName: 'WHO', sourceUrl: 'https://www.who.int' },
    
    // Éducation (3)
    { id: 'education_index', name: 'Education Index', theme: 'Education', scaleMin: 0, scaleMax: 1, higherIsBetter: true, sourceName: 'UNDP', sourceUrl: 'https://hdr.undp.org' },
    { id: 'mean_years_schooling', name: 'Mean Years of Schooling', theme: 'Education', scaleMin: 0, scaleMax: 15, higherIsBetter: true, sourceName: 'UNDP', sourceUrl: 'https://hdr.undp.org' },
    { id: 'education_expenditure', name: 'Education Expenditure (% GDP)', theme: 'Education', scaleMin: 0, scaleMax: 10, higherIsBetter: true, sourceName: 'UNESCO', sourceUrl: 'https://www.unesco.org' },
    
    // Environnement (4)
    { id: 'co2_emissions', name: 'CO2 Emissions (tons per capita)', theme: 'Environment', scaleMin: 0, scaleMax: 30, higherIsBetter: false, sourceName: 'World Bank', sourceUrl: 'https://data.worldbank.org' },
    { id: 'air_quality', name: 'Air Quality Index', theme: 'Environment', scaleMin: 0, scaleMax: 200, higherIsBetter: false, sourceName: 'IQAir', sourceUrl: 'https://www.iqair.com' },
    { id: 'clean_water_access', name: 'Clean Water Access (%)', theme: 'Environment', scaleMin: 0, scaleMax: 100, higherIsBetter: true, sourceName: 'WHO', sourceUrl: 'https://www.who.int' },
    { id: 'environmental_performance', name: 'Environmental Performance Index', theme: 'Environment', scaleMin: 0, scaleMax: 100, higherIsBetter: true, sourceName: 'Yale EPI', sourceUrl: 'https://epi.yale.edu' },
    
    // Social & Bonheur (4)
    { id: 'happiness_index', name: 'Happiness Index', theme: 'Wellbeing', scaleMin: 0, scaleMax: 10, higherIsBetter: true, sourceName: 'World Happiness Report', sourceUrl: 'https://worldhappiness.report' },
    { id: 'internet_access', name: 'Internet Access (%)', theme: 'Technology', scaleMin: 0, scaleMax: 100, higherIsBetter: true, sourceName: 'ITU', sourceUrl: 'https://www.itu.int' },
    { id: 'crime_rate', name: 'Crime Rate (per 100k)', theme: 'Security', scaleMin: 0, scaleMax: 100, higherIsBetter: false, sourceName: 'UNODC', sourceUrl: 'https://www.unodc.org' },
    { id: 'peace_index', name: 'Global Peace Index', theme: 'Security', scaleMin: 1, scaleMax: 5, higherIsBetter: false, sourceName: 'IEP', sourceUrl: 'https://www.visionofhumanity.org' },
    
    // Météo (2)
    { id: 'sunshine_hours', name: 'Sunshine Hours per Year', theme: 'Climate', scaleMin: 1000, scaleMax: 4000, higherIsBetter: true, sourceName: 'Climate Data', sourceUrl: 'https://en.climate-data.org' },
    { id: 'rainfall_mm', name: 'Annual Rainfall (mm)', theme: 'Climate', scaleMin: 0, scaleMax: 4000, higherIsBetter: true, sourceName: 'Climate Data', sourceUrl: 'https://en.climate-data.org' },
  ];

  for (const indicator of indicators) {
    await prisma.indicator.create({ data: indicator });
  }
  console.log(`✅ ${indicators.length} indicators created`);

  // Fonction pour générer des données réalistes pour TOUS les indicateurs
  function generateExtendedCountryData(iso3: string, region: string) {
    const veryHighDev = [
      'NOR', 'CHE', 'ISL', 'DNK', 'SWE', 'NLD', 'FIN', 'IRL', 'DEU', 'AUT',
      'BEL', 'LUX', 'CAN', 'AUS', 'NZL', 'SGP', 'JPN', 'KOR', 'GBR', 'FRA',
      'USA', 'ESP', 'ITA', 'ISR', 'CYP', 'MLT', 'SVN', 'EST'
    ];

    const highDev = [
      'PRT', 'GRC', 'CZE', 'POL', 'LTU', 'LVA', 'SVK', 'HUN', 'CHL', 'URY',
      'ARG', 'HRV', 'ROU', 'BGR', 'BRN', 'BHR', 'QAT', 'ARE', 'KWT', 'SAU',
      'MYS', 'TUR', 'RUS', 'BLR', 'KAZ', 'MUS', 'SRB', 'MNE', 'MKD', 'ALB',
      'BIH', 'CRI', 'PAN', 'TTO', 'BRB', 'BHS'
    ];

    const mediumDev = [
      'CHN', 'THA', 'BRA', 'MEX', 'COL', 'PER', 'ECU', 'DOM', 'JAM', 'ZAF',
      'TUN', 'DZA', 'MAR', 'EGY', 'JOR', 'LBN', 'IRN', 'ARM', 'AZE', 'GEO',
      'UKR', 'MDA', 'UZB', 'TJK', 'KGZ', 'TKM', 'MNG', 'VNM', 'PHL', 'IDN',
      'IND', 'LKA', 'BGD', 'PAK', 'BOL', 'PRY', 'GTM', 'SLV', 'HND', 'NIC',
      'NAM', 'BWA', 'GAB', 'GHA', 'KEN', 'FJI', 'WSM', 'TON', 'VUT'
    ];

    // Pays ensoleillés (pour la météo)
    const sunnyCountries = ['ARE', 'SAU', 'EGY', 'DZA', 'ESP', 'GRC', 'AUS', 'ZAF', 'CHL', 'MAR'];
    const rainyCountries = ['SGP', 'MYS', 'IDN', 'IRL', 'GBR', 'NOR', 'NZL', 'COL', 'PNG'];

    let devLevel = 'low';
    if (veryHighDev.includes(iso3)) devLevel = 'veryHigh';
    else if (highDev.includes(iso3)) devLevel = 'high';
    else if (mediumDev.includes(iso3)) devLevel = 'medium';

    // Gouvernance & Droits
    let freedom, stability, corruption, press, gender;
    if (devLevel === 'veryHigh') {
      freedom = 85 + Math.random() * 15;
      stability = 0.9 + Math.random() * 1.3;
      corruption = 1.2 + Math.random() * 1.0;
      press = Math.random() * 20;
      gender = 0.82 + Math.random() * 0.15;
    } else if (devLevel === 'high') {
      freedom = 60 + Math.random() * 30;
      stability = 0.2 + Math.random() * 1.0;
      corruption = 0.0 + Math.random() * 1.2;
      press = 20 + Math.random() * 60;
      gender = 0.68 + Math.random() * 0.22;
    } else if (devLevel === 'medium') {
      freedom = 35 + Math.random() * 40;
      stability = -0.5 + Math.random() * 1.2;
      corruption = -0.5 + Math.random() * 1.0;
      press = 40 + Math.random() * 80;
      gender = 0.55 + Math.random() * 0.25;
    } else {
      freedom = 10 + Math.random() * 40;
      stability = -1.5 + Math.random() * 1.5;
      corruption = -1.5 + Math.random() * 1.0;
      press = 60 + Math.random() * 100;
      gender = 0.40 + Math.random() * 0.30;
    }

    // Économie
    let gdp, unemployment, inflation, debt, competitiveness, gini;
    if (devLevel === 'veryHigh') {
      gdp = 45000 + Math.random() * 50000;
      unemployment = 3 + Math.random() * 5;
      inflation = 1 + Math.random() * 3;
      debt = 40 + Math.random() * 80;
      competitiveness = 70 + Math.random() * 30;
      gini = 25 + Math.random() * 15;
    } else if (devLevel === 'high') {
      gdp = 12000 + Math.random() * 35000;
      unemployment = 5 + Math.random() * 8;
      inflation = 2 + Math.random() * 5;
      debt = 30 + Math.random() * 90;
      competitiveness = 50 + Math.random() * 30;
      gini = 30 + Math.random() * 20;
    } else if (devLevel === 'medium') {
      gdp = 3000 + Math.random() * 14000;
      unemployment = 6 + Math.random() * 12;
      inflation = 3 + Math.random() * 8;
      debt = 40 + Math.random() * 80;
      competitiveness = 35 + Math.random() * 30;
      gini = 35 + Math.random() * 20;
    } else {
      gdp = 500 + Math.random() * 4500;
      unemployment = 8 + Math.random() * 15;
      inflation = 4 + Math.random() * 12;
      debt = 30 + Math.random() * 100;
      competitiveness = 20 + Math.random() * 30;
      gini = 40 + Math.random() * 25;
    }

    // Santé
    let life, infantMort, doctors, healthExp;
    if (devLevel === 'veryHigh') {
      life = 79 + Math.random() * 7;
      infantMort = 2 + Math.random() * 3;
      doctors = 3 + Math.random() * 4;
      healthExp = 8 + Math.random() * 8;
    } else if (devLevel === 'high') {
      life = 72 + Math.random() * 10;
      infantMort = 5 + Math.random() * 10;
      doctors = 2 + Math.random() * 2;
      healthExp = 5 + Math.random() * 5;
    } else if (devLevel === 'medium') {
      life = 65 + Math.random() * 12;
      infantMort = 15 + Math.random() * 25;
      doctors = 0.5 + Math.random() * 2;
      healthExp = 3 + Math.random() * 4;
    } else {
      life = 55 + Math.random() * 15;
      infantMort = 40 + Math.random() * 50;
      doctors = 0.1 + Math.random() * 1;
      healthExp = 2 + Math.random() * 4;
    }

    // Éducation
    let eduIndex, schoolYears, eduExp;
    if (devLevel === 'veryHigh') {
      eduIndex = 0.88 + Math.random() * 0.12;
      schoolYears = 11 + Math.random() * 3;
      eduExp = 5 + Math.random() * 3;
    } else if (devLevel === 'high') {
      eduIndex = 0.70 + Math.random() * 0.22;
      schoolYears = 8 + Math.random() * 4;
      eduExp = 4 + Math.random() * 3;
    } else if (devLevel === 'medium') {
      eduIndex = 0.55 + Math.random() * 0.25;
      schoolYears = 6 + Math.random() * 4;
      eduExp = 3 + Math.random() * 3;
    } else {
      eduIndex = 0.35 + Math.random() * 0.30;
      schoolYears = 3 + Math.random() * 5;
      eduExp = 2 + Math.random() * 3;
    }

    // Environnement
    let co2, airQuality, waterAccess, envPerf;
    if (devLevel === 'veryHigh') {
      co2 = 8 + Math.random() * 15;
      airQuality = 20 + Math.random() * 40;
      waterAccess = 98 + Math.random() * 2;
      envPerf = 65 + Math.random() * 30;
    } else if (devLevel === 'high') {
      co2 = 4 + Math.random() * 8;
      airQuality = 40 + Math.random() * 60;
      waterAccess = 85 + Math.random() * 13;
      envPerf = 50 + Math.random() * 25;
    } else if (devLevel === 'medium') {
      co2 = 2 + Math.random() * 6;
      airQuality = 60 + Math.random() * 80;
      waterAccess = 70 + Math.random() * 20;
      envPerf = 35 + Math.random() * 25;
    } else {
      co2 = 0.5 + Math.random() * 3;
      airQuality = 80 + Math.random() * 100;
      waterAccess = 40 + Math.random() * 40;
      envPerf = 20 + Math.random() * 30;
    }

    // Social & Bonheur
    let happiness, internet, crime, peace;
    if (devLevel === 'veryHigh') {
      happiness = 6.5 + Math.random() * 2;
      internet = 85 + Math.random() * 15;
      crime = 2 + Math.random() * 8;
      peace = 1.2 + Math.random() * 0.5;
    } else if (devLevel === 'high') {
      happiness = 5.5 + Math.random() * 2;
      internet = 65 + Math.random() * 25;
      crime = 8 + Math.random() * 15;
      peace = 1.5 + Math.random() * 0.8;
    } else if (devLevel === 'medium') {
      happiness = 4.5 + Math.random() * 2;
      internet = 40 + Math.random() * 35;
      crime = 15 + Math.random() * 25;
      peace = 1.8 + Math.random() * 1.0;
    } else {
      happiness = 3 + Math.random() * 2.5;
      internet = 10 + Math.random() * 40;
      crime = 20 + Math.random() * 40;
      peace = 2.2 + Math.random() * 1.5;
    }

    // Météo
    let sunshine, rainfall;
    if (sunnyCountries.includes(iso3)) {
      sunshine = 2800 + Math.random() * 1000;
      rainfall = 50 + Math.random() * 300;
    } else if (rainyCountries.includes(iso3)) {
      sunshine = 1200 + Math.random() * 800;
      rainfall = 1500 + Math.random() * 2000;
    } else {
      sunshine = 1800 + Math.random() * 1200;
      rainfall = 400 + Math.random() * 1200;
    }

    return {
      freedom_score: Math.round(freedom * 10) / 10,
      wgi_political_stability: Math.round(stability * 100) / 100,
      wgi_control_corruption: Math.round(corruption * 100) / 100,
      press_freedom: Math.round(press),
      gender_equality: Math.round(gender * 100) / 100,
      
      gdp_per_capita: Math.round(gdp),
      unemployment_rate: Math.round(unemployment * 10) / 10,
      inflation_rate: Math.round(inflation * 10) / 10,
      public_debt: Math.round(debt * 10) / 10,
      economic_competitiveness: Math.round(competitiveness * 10) / 10,
      gini_coefficient: Math.round(gini * 10) / 10,
      
      life_expectancy: Math.round(life * 10) / 10,
      infant_mortality: Math.round(infantMort * 10) / 10,
      doctors_per_1000: Math.round(doctors * 100) / 100,
      health_expenditure: Math.round(healthExp * 10) / 10,
      
      education_index: Math.round(eduIndex * 100) / 100,
      mean_years_schooling: Math.round(schoolYears * 10) / 10,
      education_expenditure: Math.round(eduExp * 10) / 10,
      
      co2_emissions: Math.round(co2 * 10) / 10,
      air_quality: Math.round(airQuality),
      clean_water_access: Math.round(waterAccess * 10) / 10,
      environmental_performance: Math.round(envPerf * 10) / 10,
      
      happiness_index: Math.round(happiness * 10) / 10,
      internet_access: Math.round(internet * 10) / 10,
      crime_rate: Math.round(crime * 10) / 10,
      peace_index: Math.round(peace * 10) / 10,
      
      sunshine_hours: Math.round(sunshine),
      rainfall_mm: Math.round(rainfall),
    };
  }

  const year = 2023;
  console.log('⏳ Generating data for all countries...');
  let progress = 0;

  // Générer les données pour chaque pays
  for (const country of countries) {
    const values = generateExtendedCountryData(country.iso3, country.region);

    for (const [indicatorId, rawValue] of Object.entries(values)) {
      const indicator = indicators.find((i) => i.id === indicatorId)!;
      let valueNorm: number;

      // Normalisation spécifique par indicateur
      if (indicatorId === 'freedom_score') {
        valueNorm = rawValue;
      } else if (indicatorId.startsWith('wgi_')) {
        valueNorm = ((rawValue + 2.5) / 5.0) * 100;
      } else if (indicator.higherIsBetter === false) {
        // Pour les indicateurs où plus petit = mieux (inverser)
        valueNorm = 100 - ((rawValue - indicator.scaleMin) / (indicator.scaleMax - indicator.scaleMin)) * 100;
      } else if (indicator.higherIsBetter === true) {
        valueNorm = ((rawValue - indicator.scaleMin) / (indicator.scaleMax - indicator.scaleMin)) * 100;
      } else {
        // Pour rainfall (pas de jugement de valeur)
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

    progress++;
    if (progress % 20 === 0) {
      console.log(`   ${progress}/${countries.length} countries processed...`);
    }
  }

  console.log('✅ Data generated for all countries');

  // Poids par défaut pour le score global (équilibré)
  const defaultWeights = {
    freedom_score: 0.05,
    wgi_political_stability: 0.04,
    wgi_control_corruption: 0.04,
    press_freedom: 0.03,
    gender_equality: 0.03,
    
    gdp_per_capita: 0.06,
    unemployment_rate: 0.03,
    inflation_rate: 0.02,
    public_debt: 0.02,
    economic_competitiveness: 0.04,
    gini_coefficient: 0.03,
    
    life_expectancy: 0.05,
    infant_mortality: 0.04,
    doctors_per_1000: 0.03,
    health_expenditure: 0.02,
    
    education_index: 0.05,
    mean_years_schooling: 0.03,
    education_expenditure: 0.02,
    
    co2_emissions: 0.03,
    air_quality: 0.03,
    clean_water_access: 0.04,
    environmental_performance: 0.04,
    
    happiness_index: 0.06,
    internet_access: 0.03,
    crime_rate: 0.04,
    peace_index: 0.04,
    
    sunshine_hours: 0.02,
    rainfall_mm: 0.01,
  };

  await prisma.weightProfile.create({
    data: {
      id: 'default',
      name: 'Default Balanced Profile',
      weights: JSON.stringify(defaultWeights),
    },
  });

  console.log('⏳ Computing scores...');

  // Calculer les scores globaux
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

  console.log('✅ Scores computed');
  console.log('\n🎉 ========================================');
  console.log(`🌍 SUCCESS! ${countries.length} countries`);
  console.log(`📊 ${indicators.length} indicators`);
  console.log(`📈 ${countries.length * indicators.length} data points`);
  console.log('=========================================');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });