-- CreateEnum
CREATE TYPE "SettingCategory" AS ENUM ('WHATSAPP');

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "category" "SettingCategory" NOT NULL,
    "jsonSettings" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
