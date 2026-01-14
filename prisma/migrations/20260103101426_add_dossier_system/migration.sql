/*
  Warnings:

  - A unique constraint covering the columns `[document_snapshot_id]` on the table `subscription_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('APPLICANT', 'GUARANTOR', 'LEGAL_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('STUDENT', 'EMPLOYEE', 'SELF_EMPLOYED', 'ENTREPRENEUR', 'RETIRED', 'UNEMPLOYED', 'OTHER');

-- CreateEnum
CREATE TYPE "NationalityGroup" AS ENUM ('FR', 'EU', 'NON_EU');

-- CreateEnum
CREATE TYPE "GuarantorType" AS ENUM ('PERSON', 'ORGANISM');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('IDENTITY', 'RESIDENCY_RIGHT', 'STUDENT_ENROLLMENT', 'PROFESSIONAL_STATUS_PROOF', 'INCOME_PROOF', 'TAX_NOTICE', 'ADDRESS_PROOF', 'GUARANTEE_CERTIFICATE');

-- AlterTable
ALTER TABLE "subscription_requests" ADD COLUMN     "document_snapshot_id" TEXT;

-- CreateTable
CREATE TABLE "dossier_persons" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "role" "PersonRole" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "PersonStatus" NOT NULL DEFAULT 'OTHER',
    "nationality" "NationalityGroup" NOT NULL DEFAULT 'FR',
    "is_minor" BOOLEAN NOT NULL DEFAULT false,
    "guarantor_type" "GuarantorType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossier_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "type" "DocType" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_document_snapshots" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_document_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_requests_document_snapshot_id_key" ON "subscription_requests"("document_snapshot_id");

-- AddForeignKey
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_document_snapshot_id_fkey" FOREIGN KEY ("document_snapshot_id") REFERENCES "lead_document_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_persons" ADD CONSTRAINT "dossier_persons_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "dossier_persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
