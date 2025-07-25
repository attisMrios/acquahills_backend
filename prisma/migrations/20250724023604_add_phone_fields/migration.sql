/*
  Warnings:

  - You are about to drop the `fcm_tokens` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `countryCode` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullPhone` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "fcm_tokens" DROP CONSTRAINT "fcm_tokens_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "fullPhone" TEXT NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "fcm_tokens";
