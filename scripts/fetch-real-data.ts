/**
 * Script pour récupérer les VRAIES données depuis les APIs publiques
 * Sources: World Bank, Freedom House, World Happiness Report, etc.
 */

console.log('🕐 Started at:', new Date().toISOString());
console.log('📍 Environment:', process.env.NODE_ENV || 'development');

interface RealDataPoint {
  iso3: string;
  indicatorId: string;
  value: number;
  year: number;
}

interface DataSource {
  id: string;
  name: string;
  fetchFn: () => Promise<RealDataPoint[]>;
}

// Récupérer les données de la World Bank API
async function fetchWorldBankIndicator(
  indicatorCode: string,
  indicatorId: string,
  year: number = 2023,
  minYear: number = 2015  // <-- AJOUTER CE PARAMÈTRE
): Promise<RealDataPoint[]> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&date=${year}&per_page=500&MRV=1`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data[1]) {
  if (year <= minYear) {
    console.warn(`⚠️  No data for ${indicatorId} after ${minYear}, skipping.`);
    return [];
  }
  console.warn(`⚠️  No data for ${indicatorId} in ${year}, trying ${year - 1}...`);
  return fetchWorldBankIndicator(indicatorCode, indicatorId, year - 1, minYear);
}

    const points: RealDataPoint[] = data[1]
      .filter((record: any) => record.value !== null && record.countryiso3code)
      .map((record: any) => ({
        iso3: record.countryiso3code,
        indicatorId,
        value: parseFloat(record.value),
        year: parseInt(record.date),
      }));

    console.log(`   ✅ ${indicatorId}: ${points.length} pays`);
    return points;
  } catch (error) {
    console.error(`   ❌ Error fetching ${indicatorId}:`, error);
    return [];
  }
}

// Sources de données avec codes World Bank
const DATA_SOURCES: DataSource[] = [
  {
    id: 'gdp_per_capita',
    name: 'GDP per Capita (Current US$)',
    fetchFn: () => fetchWorldBankIndicator('NY.GDP.PCAP.CD', 'gdp_per_capita'),
  },
  {
    id: 'life_expectancy',
    name: 'Life Expectancy at Birth',
    fetchFn: () => fetchWorldBankIndicator('SP.DYN.LE00.IN', 'life_expectancy'),
  },
  {
    id: 'unemployment_rate',
    name: 'Unemployment Rate',
    fetchFn: () => fetchWorldBankIndicator('SL.UEM.TOTL.ZS', 'unemployment_rate'),
  },
  {
    id: 'co2_emissions',
    name: 'CO2 Emissions (metric tons per capita)',
    fetchFn: () => fetchWorldBankIndicator('EN.ATM.CO2E.PC', 'co2_emissions'),
  },
  {
    id: 'internet_access',
    name: 'Internet Users (% of population)',
    fetchFn: () => fetchWorldBankIndicator('IT.NET.USER.ZS', 'internet_access'),
  },
  {
    id: 'education_expenditure',
    name: 'Education Expenditure (% of GDP)',
    fetchFn: () => fetchWorldBankIndicator('SE.XPD.TOTL.GD.ZS', 'education_expenditure'),
  },
  {
    id: 'health_expenditure',
    name: 'Health Expenditure (% of GDP)',
    fetchFn: () => fetchWorldBankIndicator('SH.XPD.CHEX.GD.ZS', 'health_expenditure'),
  },
  {
    id: 'infant_mortality',
    name: 'Infant Mortality (per 1000 live births)',
    fetchFn: () => fetchWorldBankIndicator('SP.DYN.IMRT.IN', 'infant_mortality'),
  },
  {
    id: 'gini_coefficient',
    name: 'Gini Coefficient',
    fetchFn: () => fetchWorldBankIndicator('SI.POV.GINI', 'gini_coefficient'),
  },
  {
    id: 'clean_water_access',
    name: 'Access to Clean Water (% of population)',
    fetchFn: () => fetchWorldBankIndicator('SH.H2O.SMDW.ZS', 'clean_water_access'),
  },
];

async function fetchAllRealData(): Promise<Record<string, RealDataPoint[]>> {
  console.log('🌍 Fetching REAL data from World Bank API...\n');
  
  const results: Record<string, RealDataPoint[]> = {};
  let totalPoints = 0;

  for (const source of DATA_SOURCES) {
    console.log(`📊 ${source.name}...`);
    
    try {
      const data = await source.fetchFn();
      results[source.id] = data;
      totalPoints += data.length;
      
      // Rate limiting - attendre 1 seconde entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Failed:`, error);
    }
  }

  console.log(`\n✅ Total: ${totalPoints} data points across ${Object.keys(results).length} indicators`);
  
  return results;
}

async function saveToFile(data: Record<string, RealDataPoint[]>) {
  const fs = await import('fs');
  const path = await import('path');
  
  const outputPath = path.join(process.cwd(), 'data', 'real-data.json');
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);
}

async function main() {
  console.log('🚀 Starting real data fetch...\n');
  console.log('📡 Using World Bank Open Data API (free, no key required)\n');
  
  const realData = await fetchAllRealData();
  await saveToFile(realData);
  
  console.log('\n🎉 Done! Real data fetched successfully.');
  console.log('\nNext step: Run the import script to load this data into your database.');
}

main().catch(console.error);

console.log('🕐 Completed at:', new Date().toISOString());
console.log('\n📊 Summary:');
console.log(`   - Total indicators: ${Object.keys(realData).length}`);
console.log(`   - Total data points: ${totalPoints}`);
console.log(`   - File size: ${(JSON.stringify(realData).length / 1024).toFixed(2)} KB`);