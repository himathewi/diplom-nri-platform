-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'PARTICIPANT', 'EXPERT');

-- CreateEnum
CREATE TYPE "ScenarioDomain" AS ENUM ('CROP_PRODUCTION', 'GREENHOUSE', 'LIVESTOCK', 'LOGISTICS', 'PROCESSING', 'ROBOTICS', 'TEAMBUILDING');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRODUCTION_PROBLEM', 'WEATHER_CHANGE', 'RESOURCE_LIMIT', 'EQUIPMENT_FAILURE', 'TEAM_CONFLICT', 'INFORMATION_UPDATE');

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "alignment" TEXT,
    "background" TEXT,
    "avatarUrl" TEXT,
    "currentHp" INTEGER NOT NULL DEFAULT 0,
    "temporaryHp" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "spellcastingAbility" TEXT,
    "deathSaveSuccesses" INTEGER NOT NULL DEFAULT 0,
    "deathSaveFailures" INTEGER NOT NULL DEFAULT 0,
    "hitDiceTotal" INTEGER,
    "hitDiceUsed" INTEGER NOT NULL DEFAULT 0,
    "hitDiceDice" TEXT,
    "spellSlots" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStats" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "wisdom" INTEGER NOT NULL,
    "charisma" INTEGER NOT NULL,

    CONSTRAINT "CharacterStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAttack" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attackType" TEXT,
    "ability" TEXT,
    "proficient" BOOLEAN NOT NULL DEFAULT false,
    "damageDice" TEXT,
    "damageBonus" INTEGER,
    "damageType" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "itemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterAttack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSpell" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT,
    "castingTime" TEXT,
    "range" TEXT,
    "components" TEXT,
    "duration" TEXT,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSpell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "slot" TEXT,
    "description" TEXT,
    "allowedSlots" JSONB,
    "effects" JSONB,
    "weaponConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemTemplateId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "equippedSlot" TEXT,
    "notes" TEXT,
    "type" TEXT,
    "allowedSlots" JSONB,
    "effects" JSONB,
    "weaponConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterHpIncrease" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "dice" TEXT NOT NULL,
    "rolledValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterHpIncrease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleInTeam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" "ScenarioDomain" NOT NULL,
    "goal" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioTask" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "expectedResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "teamId" TEXT,
    "moderatorId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "characterId" TEXT,
    "userId" TEXT,
    "eventId" TEXT,
    "description" TEXT NOT NULL,
    "result" TEXT,
    "moderatorComment" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMetric" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "communicationScore" INTEGER NOT NULL DEFAULT 0,
    "decisionSpeedScore" INTEGER NOT NULL DEFAULT 0,
    "roleDistributionScore" INTEGER NOT NULL DEFAULT 0,
    "conflictResolutionScore" INTEGER NOT NULL DEFAULT 0,
    "leadershipScore" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReport" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "successfulActions" TEXT,
    "problemActions" TEXT,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStats_characterId_key" ON "CharacterStats"("characterId");

-- CreateIndex
CREATE INDEX "CharacterAttack_characterId_idx" ON "CharacterAttack"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSpell_characterId_idx" ON "CharacterSpell"("characterId");

-- CreateIndex
CREATE INDEX "CharacterItem_characterId_idx" ON "CharacterItem"("characterId");

-- CreateIndex
CREATE INDEX "CharacterItem_itemTemplateId_idx" ON "CharacterItem"("itemTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterItem_characterId_equippedSlot_key" ON "CharacterItem"("characterId", "equippedSlot");

-- CreateIndex
CREATE INDEX "CharacterHpIncrease_characterId_idx" ON "CharacterHpIncrease"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHpIncrease_characterId_level_key" ON "CharacterHpIncrease"("characterId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "Scenario_createdById_idx" ON "Scenario"("createdById");

-- CreateIndex
CREATE INDEX "ScenarioTask_scenarioId_idx" ON "ScenarioTask"("scenarioId");

-- CreateIndex
CREATE INDEX "GameSession_scenarioId_idx" ON "GameSession"("scenarioId");

-- CreateIndex
CREATE INDEX "GameSession_teamId_idx" ON "GameSession"("teamId");

-- CreateIndex
CREATE INDEX "GameSession_moderatorId_idx" ON "GameSession"("moderatorId");

-- CreateIndex
CREATE INDEX "SessionParticipant_sessionId_idx" ON "SessionParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "SessionParticipant_characterId_idx" ON "SessionParticipant"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_characterId_key" ON "SessionParticipant"("sessionId", "characterId");

-- CreateIndex
CREATE INDEX "SessionEvent_sessionId_idx" ON "SessionEvent"("sessionId");

-- CreateIndex
CREATE INDEX "Decision_sessionId_idx" ON "Decision"("sessionId");

-- CreateIndex
CREATE INDEX "Decision_characterId_idx" ON "Decision"("characterId");

-- CreateIndex
CREATE INDEX "Decision_userId_idx" ON "Decision"("userId");

-- CreateIndex
CREATE INDEX "Decision_eventId_idx" ON "Decision"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMetric_sessionId_key" ON "TeamMetric"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionReport_sessionId_key" ON "SessionReport"("sessionId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterStats" ADD CONSTRAINT "CharacterStats_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAttack" ADD CONSTRAINT "CharacterAttack_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpell" ADD CONSTRAINT "CharacterSpell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterItem" ADD CONSTRAINT "CharacterItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterItem" ADD CONSTRAINT "CharacterItem_itemTemplateId_fkey" FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterHpIncrease" ADD CONSTRAINT "CharacterHpIncrease_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioTask" ADD CONSTRAINT "ScenarioTask_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionEvent" ADD CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SessionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMetric" ADD CONSTRAINT "TeamMetric_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReport" ADD CONSTRAINT "SessionReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
