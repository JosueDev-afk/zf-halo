-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('OPERATIVE', 'IN_MAINTENANCE', 'OUT_OF_SERVICE', 'CALIBRATION', 'LOANED', 'DECOMMISSIONED', 'IN_TRANSIT', 'IN_CUSTOMS', 'UNDER_EVALUATION', 'CANNIBALIZED', 'IMPAIRMENT');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('IMPORT', 'NATIONAL');

-- CreateEnum
CREATE TYPE "NationalType" AS ENUM ('OWN', 'TEMPORARY', 'DEFINITIVE');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "identifier" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "sub_area" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "initial_quantity" INTEGER,
    "current_quantity" INTEGER,
    "project_name" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "year" INTEGER,
    "customs_document" TEXT,
    "invoice" TEXT,
    "commercial_value" DECIMAL(65,30) NOT NULL,
    "purchase_date" TIMESTAMP(3),
    "description" TEXT,
    "comments" TEXT,
    "purchase_type" "PurchaseType" NOT NULL,
    "national_type" "NationalType",
    "machine_status" "MachineStatus" NOT NULL DEFAULT 'OPERATIVE',
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_identifier_key" ON "assets"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "assets_tag_key" ON "assets"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "assets_serial_number_key" ON "assets"("serial_number");

-- CreateIndex
CREATE INDEX "assets_tag_idx" ON "assets"("tag");

-- CreateIndex
CREATE INDEX "assets_area_idx" ON "assets"("area");

-- CreateIndex
CREATE INDEX "assets_machine_status_idx" ON "assets"("machine_status");

-- CreateIndex
CREATE INDEX "assets_is_active_idx" ON "assets"("is_active");

-- CreateIndex
CREATE INDEX "assets_identifier_idx" ON "assets"("identifier");
