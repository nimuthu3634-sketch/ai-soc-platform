/*
  Warnings:

  - You are about to drop the column `metadata` on the `Log` table. All the data in the column will be lost.
  - Added the required column `host` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('AUTHENTICATION', 'PROCESS_EXECUTION', 'NETWORK_TRAFFIC', 'EMAIL_SECURITY', 'PRIVILEGE_CHANGE', 'FILE_ACTIVITY', 'CLOUD_AUDIT');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('NEW', 'REVIEWED', 'INVESTIGATING', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "metadata",
ADD COLUMN     "eventType" "LogEventType" NOT NULL DEFAULT 'AUTHENTICATION',
ADD COLUMN     "host" TEXT NOT NULL,
ADD COLUMN     "rawData" JSONB,
ADD COLUMN     "status" "LogStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp");

-- CreateIndex
CREATE INDEX "Log_severity_timestamp_idx" ON "Log"("severity", "timestamp");

-- CreateIndex
CREATE INDEX "Log_source_idx" ON "Log"("source");

-- CreateIndex
CREATE INDEX "Log_host_idx" ON "Log"("host");

-- CreateIndex
CREATE INDEX "Log_eventType_idx" ON "Log"("eventType");

-- CreateIndex
CREATE INDEX "Log_status_idx" ON "Log"("status");
