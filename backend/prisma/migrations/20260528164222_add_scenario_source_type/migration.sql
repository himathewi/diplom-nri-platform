/*
  Warnings:

  - You are about to drop the column `attributeEffects` on the `Item` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ScenarioSourceType" AS ENUM ('TEMPLATE', 'CUSTOM');

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "attributeEffects";

-- CreateTable
CREATE TABLE "ScenarioTaskRequiredItem" (
    "id" TEXT NOT NULL,
    "scenarioTaskId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioTaskRequiredItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplateRequiredItem" (
    "id" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplateRequiredItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTaskRequiredItem" (
    "id" TEXT NOT NULL,
    "sessionTaskId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTaskRequiredItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScenarioTaskRequiredItem_scenarioTaskId_idx" ON "ScenarioTaskRequiredItem"("scenarioTaskId");

-- CreateIndex
CREATE INDEX "ScenarioTaskRequiredItem_itemId_idx" ON "ScenarioTaskRequiredItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioTaskRequiredItem_scenarioTaskId_itemId_key" ON "ScenarioTaskRequiredItem"("scenarioTaskId", "itemId");

-- CreateIndex
CREATE INDEX "TaskTemplateRequiredItem_taskTemplateId_idx" ON "TaskTemplateRequiredItem"("taskTemplateId");

-- CreateIndex
CREATE INDEX "TaskTemplateRequiredItem_itemId_idx" ON "TaskTemplateRequiredItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplateRequiredItem_taskTemplateId_itemId_key" ON "TaskTemplateRequiredItem"("taskTemplateId", "itemId");

-- CreateIndex
CREATE INDEX "SessionTaskRequiredItem_sessionTaskId_idx" ON "SessionTaskRequiredItem"("sessionTaskId");

-- CreateIndex
CREATE INDEX "SessionTaskRequiredItem_itemId_idx" ON "SessionTaskRequiredItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTaskRequiredItem_sessionTaskId_itemId_key" ON "SessionTaskRequiredItem"("sessionTaskId", "itemId");

-- AddForeignKey
ALTER TABLE "ScenarioTaskRequiredItem" ADD CONSTRAINT "ScenarioTaskRequiredItem_scenarioTaskId_fkey" FOREIGN KEY ("scenarioTaskId") REFERENCES "ScenarioTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioTaskRequiredItem" ADD CONSTRAINT "ScenarioTaskRequiredItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplateRequiredItem" ADD CONSTRAINT "TaskTemplateRequiredItem_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplateRequiredItem" ADD CONSTRAINT "TaskTemplateRequiredItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTaskRequiredItem" ADD CONSTRAINT "SessionTaskRequiredItem_sessionTaskId_fkey" FOREIGN KEY ("sessionTaskId") REFERENCES "SessionTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTaskRequiredItem" ADD CONSTRAINT "SessionTaskRequiredItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
