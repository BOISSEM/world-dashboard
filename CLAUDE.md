# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive world map dashboard comparing 197 countries across 30+ global indicators (economy, health, education, environment, happiness). Hosted at **shitholecountries.fr**. Built with Next.js App Router + PostgreSQL (Neon) + Prisma.

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # prisma generate && next build
npm run lint             # ESLint

# Database
npm run db:seed:all      # Seed all 195 countries
npm run db:seed:extended # Full seed with indicators + weighted scores
npm run fetch:real-data  # Fetch indicators from external APIs
npm run import:real-data # Import data/real-data.json into DB
npm run check:data       # Verify data integrity

# Running scripts directly
npx tsx scripts/fetch-real-data.ts
npx tsx scripts/import-real-data.ts
```

No test framework is configured. `DATABASE_URL` must be set in `.env` (PostgreSQL Neon connection string).

## Architecture

### Data Flow

```
External APIs (World Bank, WHO...)
  → scripts/fetch-real-data.ts
  → data/real-data.json
  → scripts/import-real-data.ts
  → PostgreSQL (Neon via Prisma)
  → Next.js API routes
  → React components (D3 map, Recharts)
```

### Database Models (Prisma)

- **Country** – `iso3` PK, name, region
- **Indicator** – `id` PK, name, theme, `scaleMin`, `scaleMax`, `higherIsBetter`, sourceName, sourceUrl
- **CountryIndicatorValue** – unique on `(iso3, indicatorId, year)`, stores both `value` (raw) and `valueNorm` (0–100 normalized)
- **WeightProfile** – stores indicator weights as JSON string
- **ComputedScore** – PK on `(iso3, profileId, year)`, stores `score` and `coverageRatio`; cascade deletes on Country/WeightProfile removal

### Scoring & Normalization (`lib/`)

**`lib/normalizers.ts`** handles three normalization cases:
- Freedom Score (0–100): kept as-is
- WGI indicators (scale −2.5 to +2.5): linearly mapped to 0–100
- All others: linear scaling from `[scaleMin, scaleMax]` → `[0, 100]`

The `higherIsBetter` flag on Indicator reverses the normalization direction for negative metrics (CO2, crime rate, etc.).

**`lib/scoring.ts`** computes weighted scores:
- Score = `Σ(valueNorm × weight) / Σ(weights)` for available indicators
- `coverageRatio` = available weight / total weight
- Countries with `coverageRatio < 0.7` are excluded from global score display

### API Routes (`app/api/`)

All routes use `export const dynamic = 'force-dynamic'` to prevent caching.

| Route | Purpose |
|---|---|
| `GET /api/map-data` | Choropleth data — returns normalized scores per country for a given indicator or global score |
| `GET /api/countries/[iso3]` | Full indicator breakdown for one country |
| `POST /api/custom-score` | Compute on-the-fly weighted score from user-selected indicators |
| `GET /api/analytics` | Structured export for the analytics table page |
| `GET /api/compare` | Side-by-side country comparison data |
| `GET /api/indicators` | All indicators metadata |

### Frontend Components

**Map (`components/map/`)**:
- `WorldMap.tsx` — D3 choropleth with Mercator projection; uses ISO3 codes to map countries; color scale driven by `d3-scale`
- `MapControls.tsx` — indicator selector and multi-select filter for custom scoring

**`components/country/CountryDrawer.tsx`** — slide-out panel showing top 5 indicators, global score, and coverage for selected country

**Prisma client** is instantiated as a singleton in `lib/db.ts` to avoid connection pool exhaustion in development.

### CI/CD (`.github/workflows/`)

- `seed-production.yml` — manual trigger to re-seed production DB
- `monthly-data-update.yml` — automated monthly data refresh from external sources
- `test-data-update.yml` — validates data import before production push

Deployment is on **Vercel**. The `build` script intentionally omits `prisma migrate` (DB schema is managed separately; migrations run manually).
