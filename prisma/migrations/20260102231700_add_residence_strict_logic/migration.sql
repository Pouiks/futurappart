-- CreateEnum
CREATE TYPE "ResidenceStatus" AS ENUM ('NON_PARTNER', 'PARTNER_EMAIL', 'PARTNER_SLA');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "canon_residences" ADD COLUMN     "lead_cap_daily" INTEGER,
ADD COLUMN     "lead_cap_weekly" INTEGER,
ADD COLUMN     "lead_price" INTEGER,
ADD COLUMN     "leads_sent_this_week" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "leads_sent_today" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notification_email" TEXT,
ADD COLUMN     "sla_days" INTEGER,
ADD COLUMN     "status" "ResidenceStatus" NOT NULL DEFAULT 'NON_PARTNER';

-- CreateTable
CREATE TABLE "partner_configs" (
    "source_id" TEXT NOT NULL,
    "default_lead_price" INTEGER NOT NULL DEFAULT 0,
    "default_notification_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_configs_pkey" PRIMARY KEY ("source_id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "user_id" UUID,
    "session_id" TEXT NOT NULL,
    "residence_id" UUID,
    "city" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_contents" (
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "intro" TEXT,
    "hero_image_url" TEXT,
    "price" INTEGER DEFAULT 500,
    "transport_json" JSONB,
    "living_cost_json" JSONB,
    "neighborhoods_json" JSONB,
    "faq_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_contents_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_authors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "role" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "cover_image_url" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "category_id" TEXT,
    "author_id" TEXT,
    "seo_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE INDEX "events_residence_id_idx" ON "events"("residence_id");

-- CreateIndex
CREATE INDEX "events_created_at_idx" ON "events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts"("published_at");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "blog_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
