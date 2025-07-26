/*
  Warnings:

  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SettingCategory" AS ENUM ('WHATSAPP');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "countryCode" TEXT DEFAULT 'CO',
ADD COLUMN     "fullPhone" TEXT DEFAULT '',
ALTER COLUMN "phone" SET NOT NULL;

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "category" "SettingCategory" NOT NULL,
    "jsonSettings" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
