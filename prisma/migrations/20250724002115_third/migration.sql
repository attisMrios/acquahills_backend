/*
  Warnings:

  - You are about to drop the `FmcToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "FmcToken";

-- CreateTable
CREATE TABLE "fmc_tokens" (
    "token" TEXT NOT NULL,
    "lastTokenUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fmc_tokens_pkey" PRIMARY KEY ("token")
);
