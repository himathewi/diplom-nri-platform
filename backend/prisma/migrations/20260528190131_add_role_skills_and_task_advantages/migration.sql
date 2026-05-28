-- CreateEnum
CREATE TYPE "SkillBenefitType" AS ENUM ('ADVANTAGE', 'REDUCE_FATIGUE', 'WAIVE_FATIGUE');

-- CreateTable
CREATE TABLE "RoleClassSkill" (
    "id" TEXT NOT NULL,
    "roleClassId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleClassSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioTaskSkillAdvantage" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "roleSkillId" TEXT NOT NULL,
    "benefitType" "SkillBenefitType" NOT NULL DEFAULT 'ADVANTAGE',
    "fatigueCostReduction" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioTaskSkillAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplateSkillAdvantage" (
    "id" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "roleSkillId" TEXT NOT NULL,
    "benefitType" "SkillBenefitType" NOT NULL DEFAULT 'ADVANTAGE',
    "fatigueCostReduction" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplateSkillAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTaskSkillAdvantage" (
    "id" TEXT NOT NULL,
    "sessionTaskId" TEXT NOT NULL,
    "roleSkillId" TEXT NOT NULL,
    "benefitType" "SkillBenefitType" NOT NULL DEFAULT 'ADVANTAGE',
    "fatigueCostReduction" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTaskSkillAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoleClassSkill_roleClassId_idx" ON "RoleClassSkill"("roleClassId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleClassSkill_roleClassId_name_key" ON "RoleClassSkill"("roleClassId", "name");

-- CreateIndex
CREATE INDEX "ScenarioTaskSkillAdvantage_taskId_idx" ON "ScenarioTaskSkillAdvantage"("taskId");

-- CreateIndex
CREATE INDEX "ScenarioTaskSkillAdvantage_roleSkillId_idx" ON "ScenarioTaskSkillAdvantage"("roleSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioTaskSkillAdvantage_taskId_roleSkillId_key" ON "ScenarioTaskSkillAdvantage"("taskId", "roleSkillId");

-- CreateIndex
CREATE INDEX "TaskTemplateSkillAdvantage_taskTemplateId_idx" ON "TaskTemplateSkillAdvantage"("taskTemplateId");

-- CreateIndex
CREATE INDEX "TaskTemplateSkillAdvantage_roleSkillId_idx" ON "TaskTemplateSkillAdvantage"("roleSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplateSkillAdvantage_taskTemplateId_roleSkillId_key" ON "TaskTemplateSkillAdvantage"("taskTemplateId", "roleSkillId");

-- CreateIndex
CREATE INDEX "SessionTaskSkillAdvantage_sessionTaskId_idx" ON "SessionTaskSkillAdvantage"("sessionTaskId");

-- CreateIndex
CREATE INDEX "SessionTaskSkillAdvantage_roleSkillId_idx" ON "SessionTaskSkillAdvantage"("roleSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTaskSkillAdvantage_sessionTaskId_roleSkillId_key" ON "SessionTaskSkillAdvantage"("sessionTaskId", "roleSkillId");

-- AddForeignKey
ALTER TABLE "RoleClassSkill" ADD CONSTRAINT "RoleClassSkill_roleClassId_fkey" FOREIGN KEY ("roleClassId") REFERENCES "RoleClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioTaskSkillAdvantage" ADD CONSTRAINT "ScenarioTaskSkillAdvantage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ScenarioTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioTaskSkillAdvantage" ADD CONSTRAINT "ScenarioTaskSkillAdvantage_roleSkillId_fkey" FOREIGN KEY ("roleSkillId") REFERENCES "RoleClassSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplateSkillAdvantage" ADD CONSTRAINT "TaskTemplateSkillAdvantage_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplateSkillAdvantage" ADD CONSTRAINT "TaskTemplateSkillAdvantage_roleSkillId_fkey" FOREIGN KEY ("roleSkillId") REFERENCES "RoleClassSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTaskSkillAdvantage" ADD CONSTRAINT "SessionTaskSkillAdvantage_sessionTaskId_fkey" FOREIGN KEY ("sessionTaskId") REFERENCES "SessionTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTaskSkillAdvantage" ADD CONSTRAINT "SessionTaskSkillAdvantage_roleSkillId_fkey" FOREIGN KEY ("roleSkillId") REFERENCES "RoleClassSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
