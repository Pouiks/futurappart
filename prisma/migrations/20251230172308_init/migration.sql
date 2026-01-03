-- CreateEnum
CREATE TYPE "AvailabilityEnum" AS ENUM ('IMMEDIATE', 'LT_30D', 'UNKNOWN', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "UnitTypeEnum" AS ENUM ('STUDIO', 'COLOCATION', 'COLIVING', 'UNKNOWN');

-- CreateTable
CREATE TABLE "staging_units" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "external_id" TEXT,
    "name" TEXT,
    "address" TEXT,
    "city_raw" TEXT,
    "city_normalized" TEXT NOT NULL,
    "price_min" INTEGER NOT NULL,
    "surface_min" DECIMAL(5,2),
    "unit_type" "UnitTypeEnum" DEFAULT 'UNKNOWN',
    "availability" "AvailabilityEnum" DEFAULT 'UNKNOWN',
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staging_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_residences" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city_normalized" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "trust_score" INTEGER DEFAULT 50,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canon_residences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canon_units" (
    "id" TEXT NOT NULL,
    "residence_id" TEXT NOT NULL,
    "type" "UnitTypeEnum" NOT NULL,
    "price" INTEGER NOT NULL,
    "surface" DECIMAL(5,2),
    "availability" "AvailabilityEnum" NOT NULL,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canon_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_stats_daily" (
    "city_normalized" TEXT NOT NULL,
    "unit_type" "UnitTypeEnum" NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "median_price" INTEGER,
    "median_price_m2" INTEGER,
    "count_units" INTEGER,

    CONSTRAINT "city_stats_daily_pkey" PRIMARY KEY ("city_normalized","unit_type","date")
);

-- CreateIndex
CREATE UNIQUE INDEX "canon_residences_slug_key" ON "canon_residences"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "canon_residences_source_id_url_key" ON "canon_residences"("source_id", "url");

-- AddForeignKey
ALTER TABLE "canon_units" ADD CONSTRAINT "canon_units_residence_id_fkey" FOREIGN KEY ("residence_id") REFERENCES "canon_residences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
