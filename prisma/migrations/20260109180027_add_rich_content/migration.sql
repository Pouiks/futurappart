-- AlterTable
ALTER TABLE "canon_residences" ADD COLUMN     "hero_image_url" TEXT;

-- AlterTable
ALTER TABLE "canon_units" ADD COLUMN     "amenities_json" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
