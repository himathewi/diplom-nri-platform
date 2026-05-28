-- DropIndex
DROP INDEX "RoleClass_name_key";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "RoleClass" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "basedOnScenarioId" TEXT;

-- AlterTable
ALTER TABLE "ScenarioTask" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceTemplateId" TEXT;

-- CreateIndex
CREATE INDEX "Item_createdById_idx" ON "Item"("createdById");

-- CreateIndex
CREATE INDEX "Item_isPublic_idx" ON "Item"("isPublic");

-- CreateIndex
CREATE INDEX "Item_isActive_idx" ON "Item"("isActive");

-- CreateIndex
CREATE INDEX "RoleClass_createdById_idx" ON "RoleClass"("createdById");

-- CreateIndex
CREATE INDEX "RoleClass_isPublic_idx" ON "RoleClass"("isPublic");

-- CreateIndex
CREATE INDEX "RoleClass_isActive_idx" ON "RoleClass"("isActive");

-- CreateIndex
CREATE INDEX "Scenario_basedOnScenarioId_idx" ON "Scenario"("basedOnScenarioId");

-- CreateIndex
CREATE INDEX "Scenario_isPublicTemplate_idx" ON "Scenario"("isPublicTemplate");

-- CreateIndex
CREATE INDEX "ScenarioTask_createdById_idx" ON "ScenarioTask"("createdById");

-- CreateIndex
CREATE INDEX "ScenarioTask_sourceTemplateId_idx" ON "ScenarioTask"("sourceTemplateId");

-- CreateIndex
CREATE INDEX "ScenarioTask_isPublic_idx" ON "ScenarioTask"("isPublic");

-- CreateIndex
CREATE INDEX "ScenarioTask_isActive_idx" ON "ScenarioTask"("isActive");

-- CreateIndex
CREATE INDEX "TaskTemplate_isPublic_idx" ON "TaskTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "TaskTemplate_isActive_idx" ON "TaskTemplate"("isActive");

-- AddForeignKey
ALTER TABLE "RoleClass" ADD CONSTRAINT "RoleClass_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_basedOnScenarioId_fkey" FOREIGN KEY ("basedOnScenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioTask" ADD CONSTRAINT "ScenarioTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioTask" ADD CONSTRAINT "ScenarioTask_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "TaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
