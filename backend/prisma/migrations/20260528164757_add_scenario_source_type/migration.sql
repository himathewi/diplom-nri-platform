-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "sourceType" "ScenarioSourceType" NOT NULL DEFAULT 'CUSTOM';

-- CreateIndex
CREATE INDEX "Scenario_sourceType_idx" ON "Scenario"("sourceType");
