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

-- CreateIndex
CREATE INDEX "fcm_subscriptions_topic_idx" ON "fcm_subscriptions"("topic");

-- CreateIndex
CREATE INDEX "fcm_subscriptions_userId_idx" ON "fcm_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "fcm_subscriptions_userId_topic_token_key" ON "fcm_subscriptions"("userId", "topic", "token");

-- AddForeignKey
ALTER TABLE "fcm_subscriptions" ADD CONSTRAINT "fcm_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
