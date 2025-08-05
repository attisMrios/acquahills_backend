-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "common_areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maximunCapacity" INTEGER NOT NULL,
    "peoplePerReservation" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "common_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonAreaUnavailableDay" (
    "id" SERIAL NOT NULL,
    "commonAreaId" INTEGER NOT NULL,
    "weekDay" "WeekDay",
    "isFirstWorkingDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CommonAreaUnavailableDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonAreaTimeSlot" (
    "id" SERIAL NOT NULL,
    "commonAreaId" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "CommonAreaTimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommonAreaUnavailableDay" ADD CONSTRAINT "CommonAreaUnavailableDay_commonAreaId_fkey" FOREIGN KEY ("commonAreaId") REFERENCES "common_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonAreaTimeSlot" ADD CONSTRAINT "CommonAreaTimeSlot_commonAreaId_fkey" FOREIGN KEY ("commonAreaId") REFERENCES "common_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
