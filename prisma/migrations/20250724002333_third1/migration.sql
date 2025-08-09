/*
  Warnings:

  - You are about to drop the `fmc_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "fmc_tokens";

-- CreateTable
CREATE TABLE "fmTtokens" (
    "token" TEXT NOT NULL,
    "lastTokenUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fmTtokens_pkey" PRIMARY KEY ("token")
);
