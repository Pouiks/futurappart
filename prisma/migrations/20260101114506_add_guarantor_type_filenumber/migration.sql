-- AlterTable
ALTER TABLE "guarantors" ADD COLUMN     "file_number" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PHYSICAL';
