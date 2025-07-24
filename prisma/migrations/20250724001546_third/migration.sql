-- CreateTable
CREATE TABLE "FmcToken" (
    "token" TEXT NOT NULL,
    "lastTokenUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FmcToken_pkey" PRIMARY KEY ("token")
);
