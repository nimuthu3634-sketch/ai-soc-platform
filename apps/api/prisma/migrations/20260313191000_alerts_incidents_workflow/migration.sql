-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
BEGIN;
CREATE TYPE "AlertStatus_new" AS ENUM ('NEW', 'INVESTIGATING', 'ESCALATED', 'RESOLVED');
ALTER TABLE "Alert" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Alert" ALTER COLUMN "status" TYPE "AlertStatus_new" USING ("status"::text::"AlertStatus_new");
ALTER TYPE "AlertStatus" RENAME TO "AlertStatus_old";
ALTER TYPE "AlertStatus_new" RENAME TO "AlertStatus";
DROP TYPE "AlertStatus_old";
ALTER TABLE "Alert" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IncidentStatus_new" AS ENUM ('OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED');
ALTER TABLE "Incident" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus_new" USING ("status"::text::"IncidentStatus_new");
ALTER TYPE "IncidentStatus" RENAME TO "IncidentStatus_old";
ALTER TYPE "IncidentStatus_new" RENAME TO "IncidentStatus";
DROP TYPE "IncidentStatus_old";
ALTER TABLE "Incident" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_acknowledgedById_fkey";

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_incidentId_fkey";

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_logId_fkey";

-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_ownerId_fkey";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "acknowledgedAt",
DROP COLUMN "acknowledgedById",
DROP COLUMN "detectedAt",
DROP COLUMN "incidentId",
DROP COLUMN "logId",
ADD COLUMN     "confidenceScore" INTEGER NOT NULL DEFAULT 75,
ADD COLUMN     "linkedLogId" TEXT;

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "ownerId",
DROP COLUMN "priority",
DROP COLUMN "summary",
ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "relatedAlertId" TEXT,
ADD COLUMN     "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM';

-- DropEnum
DROP TYPE "IncidentPriority";

-- CreateIndex
CREATE INDEX "Alert_severity_status_idx" ON "Alert"("severity", "status");

-- CreateIndex
CREATE INDEX "Alert_source_idx" ON "Alert"("source");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_linkedLogId_idx" ON "Alert"("linkedLogId");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_relatedAlertId_key" ON "Incident"("relatedAlertId");

-- CreateIndex
CREATE INDEX "Incident_severity_status_idx" ON "Incident"("severity", "status");

-- CreateIndex
CREATE INDEX "Incident_assigneeId_idx" ON "Incident"("assigneeId");

-- CreateIndex
CREATE INDEX "Incident_openedAt_idx" ON "Incident"("openedAt");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_linkedLogId_fkey" FOREIGN KEY ("linkedLogId") REFERENCES "Log"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_relatedAlertId_fkey" FOREIGN KEY ("relatedAlertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

