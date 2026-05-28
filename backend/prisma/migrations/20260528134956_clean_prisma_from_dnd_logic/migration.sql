/*
  Warnings:

  - You are about to drop the column `characterId` on the `Decision` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Scenario` table. All the data in the column will be lost.
  - The `taskType` column on the `ScenarioTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CharacterItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionAllowedItemTemplate` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionId,userId]` on the table `SessionParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ScenarioTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SessionEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SessionParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SessionParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('TOOL', 'DOCUMENT', 'COMMUNICATION', 'SENSOR', 'SAMPLE', 'TRANSPORT', 'RESOURCE', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('MAIN', 'SIDE', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "SessionTaskStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('LINK', 'CODE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'QUALITY_ISSUE';
ALTER TYPE "EventType" ADD VALUE 'SAFETY_RISK';
ALTER TYPE "EventType" ADD VALUE 'TASK_UPDATE';

-- DropForeignKey
ALTER TABLE "CharacterItem" DROP CONSTRAINT "CharacterItem_characterId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterItem" DROP CONSTRAINT "CharacterItem_itemTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Decision" DROP CONSTRAINT "Decision_characterId_fkey";

-- DropForeignKey
ALTER TABLE "SessionAllowedItemTemplate" DROP CONSTRAINT "SessionAllowedItemTemplate_itemTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "SessionAllowedItemTemplate" DROP CONSTRAINT "SessionAllowedItemTemplate_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "SessionParticipant" DROP CONSTRAINT "SessionParticipant_characterId_fkey";

-- DropIndex
DROP INDEX "Decision_characterId_idx";

-- AlterTable
ALTER TABLE "Decision" DROP COLUMN "characterId",
ADD COLUMN     "sessionParticipantId" TEXT,
ADD COLUMN     "sessionTaskId" TEXT;

-- AlterTable
ALTER TABLE "Scenario" DROP COLUMN "domain",
ADD COLUMN     "directionId" TEXT,
ADD COLUMN     "isPublicTemplate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ScenarioTask" ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "fatigueCost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVisibleByDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderatorNotes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "taskType",
ADD COLUMN     "taskType" "TaskType" NOT NULL DEFAULT 'MAIN';

-- AlterTable
ALTER TABLE "SessionEvent" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SessionParticipant" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "characterId" DROP NOT NULL;

-- DropTable
DROP TABLE "CharacterItem";

-- DropTable
DROP TABLE "ItemTemplate";

-- DropTable
DROP TABLE "SessionAllowedItemTemplate";

-- DropEnum
DROP TYPE "ScenarioDomain";

-- CreateTable
CREATE TABLE "ScenarioDirection" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioDirection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskType" "TaskType" NOT NULL DEFAULT 'MAIN',
    "directionId" TEXT,
    "createdById" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "fatigueCost" INTEGER NOT NULL DEFAULT 0,
    "expectedResult" TEXT,
    "moderatorNotes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionInvitation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "type" "InvitationType" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "tokenHash" TEXT,
    "codeHash" TEXT,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "attributeEffects" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAllowedItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAllowedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantItem" (
    "id" TEXT NOT NULL,
    "sessionParticipantId" TEXT NOT NULL,
    "itemId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTask" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "scenarioTaskId" TEXT,
    "sourceTemplateId" TEXT,
    "title" TEXT NOT NULL,
    "descriptionForModerator" TEXT,
    "descriptionForParticipants" TEXT,
    "taskType" "TaskType" NOT NULL DEFAULT 'MAIN',
    "status" "SessionTaskStatus" NOT NULL DEFAULT 'PLANNED',
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "fatigueCost" INTEGER NOT NULL DEFAULT 0,
    "isVisibleToParticipants" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SessionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioDirection_code_key" ON "ScenarioDirection"("code");

-- CreateIndex
CREATE INDEX "TaskTemplate_directionId_idx" ON "TaskTemplate"("directionId");

-- CreateIndex
CREATE INDEX "TaskTemplate_createdById_idx" ON "TaskTemplate"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInvitation_tokenHash_key" ON "SessionInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInvitation_codeHash_key" ON "SessionInvitation"("codeHash");

-- CreateIndex
CREATE INDEX "SessionInvitation_sessionId_idx" ON "SessionInvitation"("sessionId");

-- CreateIndex
CREATE INDEX "SessionInvitation_invitedById_idx" ON "SessionInvitation"("invitedById");

-- CreateIndex
CREATE INDEX "SessionInvitation_invitedUserId_idx" ON "SessionInvitation"("invitedUserId");

-- CreateIndex
CREATE INDEX "SessionAllowedItem_sessionId_idx" ON "SessionAllowedItem"("sessionId");

-- CreateIndex
CREATE INDEX "SessionAllowedItem_itemId_idx" ON "SessionAllowedItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAllowedItem_sessionId_itemId_key" ON "SessionAllowedItem"("sessionId", "itemId");

-- CreateIndex
CREATE INDEX "ParticipantItem_sessionParticipantId_idx" ON "ParticipantItem"("sessionParticipantId");

-- CreateIndex
CREATE INDEX "ParticipantItem_itemId_idx" ON "ParticipantItem"("itemId");

-- CreateIndex
CREATE INDEX "SessionTask_sessionId_idx" ON "SessionTask"("sessionId");

-- CreateIndex
CREATE INDEX "SessionTask_scenarioTaskId_idx" ON "SessionTask"("scenarioTaskId");

-- CreateIndex
CREATE INDEX "SessionTask_sourceTemplateId_idx" ON "SessionTask"("sourceTemplateId");

-- CreateIndex
CREATE INDEX "Decision_sessionParticipantId_idx" ON "Decision"("sessionParticipantId");

-- CreateIndex
CREATE INDEX "Decision_sessionTaskId_idx" ON "Decision"("sessionTaskId");

-- CreateIndex
CREATE INDEX "Scenario_directionId_idx" ON "Scenario"("directionId");

-- CreateIndex
CREATE INDEX "SessionParticipant_userId_idx" ON "SessionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_userId_key" ON "SessionParticipant"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "ScenarioDirection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "ScenarioDirection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInvitation" ADD CONSTRAINT "SessionInvitation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInvitation" ADD CONSTRAINT "SessionInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInvitation" ADD CONSTRAINT "SessionInvitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAllowedItem" ADD CONSTRAINT "SessionAllowedItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAllowedItem" ADD CONSTRAINT "SessionAllowedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantItem" ADD CONSTRAINT "ParticipantItem_sessionParticipantId_fkey" FOREIGN KEY ("sessionParticipantId") REFERENCES "SessionParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantItem" ADD CONSTRAINT "ParticipantItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_scenarioTaskId_fkey" FOREIGN KEY ("scenarioTaskId") REFERENCES "ScenarioTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "TaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_sessionParticipantId_fkey" FOREIGN KEY ("sessionParticipantId") REFERENCES "SessionParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_sessionTaskId_fkey" FOREIGN KEY ("sessionTaskId") REFERENCES "SessionTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
