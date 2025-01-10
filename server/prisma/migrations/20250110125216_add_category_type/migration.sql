-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('FOOD', 'BEVERAGE', 'OTHER');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "CategoryType" NOT NULL DEFAULT 'FOOD';
