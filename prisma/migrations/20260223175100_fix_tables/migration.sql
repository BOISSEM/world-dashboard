/*
  Warnings:

  - You are about to drop the `countries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `country_indicator_values` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "computed_scores" DROP CONSTRAINT "computed_scores_iso3_fkey";

-- DropForeignKey
ALTER TABLE "country_indicator_values" DROP CONSTRAINT "country_indicator_values_indicatorId_fkey";

-- DropForeignKey
ALTER TABLE "country_indicator_values" DROP CONSTRAINT "country_indicator_values_iso3_fkey";

-- DropTable
DROP TABLE "countries";

-- DropTable
DROP TABLE "country_indicator_values";

-- CreateTable
CREATE TABLE "Country" (
    "iso3" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("iso3")
);

-- CreateTable
CREATE TABLE "CountryIndicatorValue" (
    "id" SERIAL NOT NULL,
    "iso3" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "valueNorm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CountryIndicatorValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CountryIndicatorValue_iso3_idx" ON "CountryIndicatorValue"("iso3");

-- CreateIndex
CREATE INDEX "CountryIndicatorValue_indicatorId_idx" ON "CountryIndicatorValue"("indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryIndicatorValue_iso3_indicatorId_year_key" ON "CountryIndicatorValue"("iso3", "indicatorId", "year");

-- AddForeignKey
ALTER TABLE "CountryIndicatorValue" ADD CONSTRAINT "CountryIndicatorValue_iso3_fkey" FOREIGN KEY ("iso3") REFERENCES "Country"("iso3") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryIndicatorValue" ADD CONSTRAINT "CountryIndicatorValue_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "computed_scores" ADD CONSTRAINT "computed_scores_iso3_fkey" FOREIGN KEY ("iso3") REFERENCES "Country"("iso3") ON DELETE CASCADE ON UPDATE CASCADE;
