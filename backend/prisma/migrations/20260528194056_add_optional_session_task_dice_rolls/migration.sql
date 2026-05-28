-- AlterTable
ALTER TABLE "ScenarioTask" ADD COLUMN     "diceDifficulty" INTEGER;

-- AlterTable
ALTER TABLE "SessionTask" ADD COLUMN     "diceDifficulty" INTEGER;

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "diceDifficulty" INTEGER;

-- CreateTable
CREATE TABLE "SessionTaskRoll" (
    "id" TEXT NOT NULL,
    "sessionTaskId" TEXT NOT NULL,
    "sessionParticipantId" TEXT NOT NULL,
    "rollValue" INTEGER NOT NULL,
    "advantageRollValue" INTEGER,
    "effectiveRoll" INTEGER NOT NULL,
    "diceDifficulty" INTEGER NOT NULL,
    "isSuccess" BOOLEAN NOT NULL,
    "fatigueApplied" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTaskRoll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionTaskRoll_sessionTaskId_idx" ON "SessionTaskRoll"("sessionTaskId");

-- CreateIndex
CREATE INDEX "SessionTaskRoll_sessionParticipantId_idx" ON "SessionTaskRoll"("sessionParticipantId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTaskRoll_sessionTaskId_sessionParticipantId_key" ON "SessionTaskRoll"("sessionTaskId", "sessionParticipantId");

-- AddForeignKey
ALTER TABLE "SessionTaskRoll" ADD CONSTRAINT "SessionTaskRoll_sessionTaskId_fkey" FOREIGN KEY ("sessionTaskId") REFERENCES "SessionTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTaskRoll" ADD CONSTRAINT "SessionTaskRoll_sessionParticipantId_fkey" FOREIGN KEY ("sessionParticipantId") REFERENCES "SessionParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
