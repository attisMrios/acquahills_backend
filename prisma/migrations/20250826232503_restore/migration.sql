-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CARRO', 'MOTO', 'CAMIONETA', 'MOTOCARRO', 'FURGON', 'CAMION');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'audio', 'video', 'document', 'button', 'location', 'sticker');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('VEHICLE', 'PET', 'COEXISTENCE', 'DAMAGE');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SettingCategory" AS ENUM ('WHATSAPP');

-- CreateTable
CREATE TABLE "user_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "countryCode" TEXT DEFAULT 'CO',
    "phone" TEXT DEFAULT '',
    "fullPhone" TEXT DEFAULT '',
    "address" TEXT,
    "birthDate" TIMESTAMP(3),
    "dni" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "property_owners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apartmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "category" "SettingCategory" NOT NULL,
    "jsonSettings" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fcm_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcm_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'CARRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "WhatsappMessage" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "waId" TEXT NOT NULL,
    "contactName" TEXT,
    "phoneNumberId" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "content" TEXT,
    "rawPayload" JSONB NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'sent',
    "conversationId" TEXT,
    "flowTrigger" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "common_areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maximunCapacity" INTEGER NOT NULL,
    "peoplePerReservation" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "typeCommonAreaId" INTEGER NOT NULL,

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

-- CreateTable
CREATE TABLE "type_common_areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "type_common_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "IncidentPriority" NOT NULL DEFAULT 'MEDIUM',
    "reportedBy" TEXT NOT NULL,
    "incidentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_name_key" ON "user_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_members_userId_userGroupId_key" ON "user_group_members"("userId", "userGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "property_owners_userId_apartmentId_key" ON "property_owners"("userId", "apartmentId");

-- CreateIndex
CREATE INDEX "fcm_subscriptions_topic_idx" ON "fcm_subscriptions"("topic");

-- CreateIndex
CREATE INDEX "fcm_subscriptions_userId_idx" ON "fcm_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "fcm_subscriptions_userId_topic_token_key" ON "fcm_subscriptions"("userId", "topic", "token");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappMessage_messageId_key" ON "WhatsappMessage"("messageId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_waId_idx" ON "WhatsappMessage"("waId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_conversationId_idx" ON "WhatsappMessage"("conversationId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_flowTrigger_idx" ON "WhatsappMessage"("flowTrigger");

-- CreateIndex
CREATE INDEX "WhatsappMessage_receivedAt_idx" ON "WhatsappMessage"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "type_common_areas_name_key" ON "type_common_areas"("name");

-- AddForeignKey
ALTER TABLE "user_group_members" ADD CONSTRAINT "user_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_members" ADD CONSTRAINT "user_group_members_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fcm_subscriptions" ADD CONSTRAINT "fcm_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "common_areas" ADD CONSTRAINT "common_areas_typeCommonAreaId_fkey" FOREIGN KEY ("typeCommonAreaId") REFERENCES "type_common_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonAreaUnavailableDay" ADD CONSTRAINT "CommonAreaUnavailableDay_commonAreaId_fkey" FOREIGN KEY ("commonAreaId") REFERENCES "common_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonAreaTimeSlot" ADD CONSTRAINT "CommonAreaTimeSlot_commonAreaId_fkey" FOREIGN KEY ("commonAreaId") REFERENCES "common_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
