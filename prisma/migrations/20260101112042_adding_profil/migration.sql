-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "country_code" TEXT DEFAULT '+33',
    "birthdate" DATE,
    "status" TEXT,
    "arrival_date" DATE,
    "income" INTEGER DEFAULT 0,
    "caf_number" TEXT,
    "has_guarantor" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guarantors" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "income" INTEGER,
    "relationship" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guarantors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_intents" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "residence_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_unit_id_key" ON "favorites"("user_id", "unit_id");

-- AddForeignKey
ALTER TABLE "guarantors" ADD CONSTRAINT "guarantors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "canon_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
