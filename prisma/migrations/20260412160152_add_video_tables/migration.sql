-- CreateEnum
CREATE TYPE "VideoMode" AS ENUM ('TEMPLATE', 'CREATIVE');

-- CreateEnum
CREATE TYPE "VideoJobType" AS ENUM ('PREVIEW', 'FINAL');

-- CreateEnum
CREATE TYPE "VideoJobStatus" AS ENUM ('PENDING', 'RENDERING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "mode" "VideoMode" NOT NULL,
    "dsl" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_jobs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "VideoJobType" NOT NULL,
    "status" "VideoJobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outputUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "video_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeCustomerId_key" ON "user_subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeSubscriptionId_key" ON "user_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "user_subscriptions_stripeCustomerId_idx" ON "user_subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "user_subscriptions_stripeSubscriptionId_idx" ON "user_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");

-- CreateIndex
CREATE INDEX "video_projects_userId_chatId_idx" ON "video_projects"("userId", "chatId");

-- CreateIndex
CREATE INDEX "video_jobs_projectId_idx" ON "video_jobs"("projectId");

-- CreateIndex
CREATE INDEX "video_jobs_status_idx" ON "video_jobs"("status");

-- AddForeignKey
ALTER TABLE "video_jobs" ADD CONSTRAINT "video_jobs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "video_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
