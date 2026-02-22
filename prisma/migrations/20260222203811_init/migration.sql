-- CreateTable
CREATE TABLE "countries" (
    "iso3" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("iso3")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "scaleMin" DOUBLE PRECISION NOT NULL,
    "scaleMax" DOUBLE PRECISION NOT NULL,
    "higherIsBetter" BOOLEAN NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_indicator_values" (
    "iso3" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "valueNorm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "country_indicator_values_pkey" PRIMARY KEY ("iso3","indicatorId","year")
);

-- CreateTable
CREATE TABLE "weight_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weights" TEXT NOT NULL,

    CONSTRAINT "weight_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "computed_scores" (
    "iso3" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "coverageRatio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "computed_scores_pkey" PRIMARY KEY ("iso3","profileId","year")
);

-- AddForeignKey
ALTER TABLE "country_indicator_values" ADD CONSTRAINT "country_indicator_values_iso3_fkey" FOREIGN KEY ("iso3") REFERENCES "countries"("iso3") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_indicator_values" ADD CONSTRAINT "country_indicator_values_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "computed_scores" ADD CONSTRAINT "computed_scores_iso3_fkey" FOREIGN KEY ("iso3") REFERENCES "countries"("iso3") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "computed_scores" ADD CONSTRAINT "computed_scores_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "weight_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
