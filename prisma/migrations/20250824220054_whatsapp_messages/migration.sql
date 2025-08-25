-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'audio', 'video', 'document', 'button', 'location', 'sticker');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

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
