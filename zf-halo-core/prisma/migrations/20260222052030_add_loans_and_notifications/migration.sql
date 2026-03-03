-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('REQUESTED', 'AUTHORIZED', 'CHECKED_OUT', 'RETURNED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SERIALIZED', 'BULK');

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "asset_type" "AssetType" NOT NULL DEFAULT 'SERIALIZED';

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'REQUESTED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "estimated_return_date" TIMESTAMP(3) NOT NULL,
    "departure_date" TIMESTAMP(3),
    "actual_return_date" TIMESTAMP(3),
    "comments" TEXT,
    "requester_id" TEXT NOT NULL,
    "authorizer_id" TEXT,
    "asset_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destinations_name_key" ON "destinations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "loans_folio_key" ON "loans"("folio");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_requester_id_idx" ON "loans"("requester_id");

-- CreateIndex
CREATE INDEX "loans_asset_id_idx" ON "loans"("asset_id");

-- CreateIndex
CREATE INDEX "loans_folio_idx" ON "loans"("folio");

-- CreateIndex
CREATE INDEX "internal_notifications_user_id_status_idx" ON "internal_notifications"("user_id", "status");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_authorizer_id_fkey" FOREIGN KEY ("authorizer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notifications" ADD CONSTRAINT "internal_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
