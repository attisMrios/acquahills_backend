/*
  Warnings:

  - You are about to drop the `fcm_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "fcm_tokens" DROP CONSTRAINT "fcm_tokens_userId_fkey";

-- DropTable
DROP TABLE "fcm_tokens";

-- CreateTable
CREATE TABLE "apartments" (
    "id" SERIAL NOT NULL,
    "apartment" VARCHAR(10) NOT NULL,
    "house" VARCHAR(50) NOT NULL,
    "fullAddress" VARCHAR(150) NOT NULL,
    "block" VARCHAR(10) NOT NULL,
    "floor" VARCHAR(10) NOT NULL,
    "tower" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);
