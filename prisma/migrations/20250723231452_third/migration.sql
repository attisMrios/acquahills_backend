/*
  Warnings:

  - You are about to drop the column `type` on the `vehicles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VehiculeType" AS ENUM ('CARRO', 'MOTO', 'CAMIONETA');

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "type",
ADD COLUMN     "vehicleType" "VehiculeType" NOT NULL DEFAULT 'CARRO';
