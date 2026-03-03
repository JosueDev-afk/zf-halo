-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location_name" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION;
