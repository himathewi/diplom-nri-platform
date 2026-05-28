CREATE TABLE "RoleClass" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RoleClass_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoleClass_name_key" ON "RoleClass"("name");

INSERT INTO "RoleClass" ("id", "name", "description", "updatedAt")
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Агроном', 'Профиль для оценки агротехнологий, ресурсов и производственных рисков.', CURRENT_TIMESTAMP),
  ('22222222-2222-4222-8222-222222222222', 'Инженер', 'Профиль для анализа оборудования, инфраструктуры и технических ограничений.', CURRENT_TIMESTAMP),
  ('33333333-3333-4333-8333-333333333333', 'Логист', 'Профиль для планирования поставок, маршрутов и складских ресурсов.', CURRENT_TIMESTAMP),
  ('44444444-4444-4444-8444-444444444444', 'Специалист по качеству', 'Профиль для контроля стандартов, отклонений и требований к продукции.', CURRENT_TIMESTAMP),
  ('55555555-5555-4555-8555-555555555555', 'Руководитель смены', 'Профиль для координации команды, приоритизации задач и принятия решений.', CURRENT_TIMESTAMP),
  ('66666666-6666-4666-8666-666666666666', 'Оператор техники', 'Профиль для работы с техникой, регламентами эксплуатации и инцидентами.', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "Character"
  ADD COLUMN "roleClassId" TEXT,
  ADD COLUMN "professionalFunction" TEXT,
  ADD COLUMN "fatigueLimit" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "currentFatigue" INTEGER NOT NULL DEFAULT 0;

UPDATE "Character" AS c
SET "fatigueLimit" = GREATEST(
  3,
  3 + FLOOR(((COALESCE(s."constitution", 10) - 10)::numeric) / 2)::integer
)
FROM "CharacterStats" AS s
WHERE s."characterId" = c."id";

DELETE FROM "Character"
WHERE "userId" IS NULL;

ALTER TABLE "Character" DROP CONSTRAINT IF EXISTS "Character_userId_fkey";
ALTER TABLE "Character"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Character"
  ADD CONSTRAINT "Character_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Character"
  ADD CONSTRAINT "Character_roleClassId_fkey"
  FOREIGN KEY ("roleClassId") REFERENCES "RoleClass"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Character_roleClassId_idx" ON "Character"("roleClassId");

ALTER TABLE "Character"
  DROP COLUMN IF EXISTS "race",
  DROP COLUMN IF EXISTS "className",
  DROP COLUMN IF EXISTS "level",
  DROP COLUMN IF EXISTS "alignment",
  DROP COLUMN IF EXISTS "background",
  DROP COLUMN IF EXISTS "avatarUrl",
  DROP COLUMN IF EXISTS "currentHp",
  DROP COLUMN IF EXISTS "temporaryHp",
  DROP COLUMN IF EXISTS "speed",
  DROP COLUMN IF EXISTS "inspiration";

DROP INDEX IF EXISTS "CharacterItem_characterId_equippedSlot_key";

ALTER TABLE "ItemTemplate"
  DROP COLUMN IF EXISTS "slot",
  DROP COLUMN IF EXISTS "allowedSlots";

ALTER TABLE "CharacterItem"
  DROP COLUMN IF EXISTS "isEquipped",
  DROP COLUMN IF EXISTS "equippedSlot",
  DROP COLUMN IF EXISTS "allowedSlots";

CREATE TABLE "SessionAllowedRoleClass" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "roleClassId" TEXT NOT NULL,

  CONSTRAINT "SessionAllowedRoleClass_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SessionAllowedRoleClass_sessionId_roleClassId_key"
  ON "SessionAllowedRoleClass"("sessionId", "roleClassId");
CREATE INDEX "SessionAllowedRoleClass_sessionId_idx"
  ON "SessionAllowedRoleClass"("sessionId");
CREATE INDEX "SessionAllowedRoleClass_roleClassId_idx"
  ON "SessionAllowedRoleClass"("roleClassId");

ALTER TABLE "SessionAllowedRoleClass"
  ADD CONSTRAINT "SessionAllowedRoleClass_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionAllowedRoleClass"
  ADD CONSTRAINT "SessionAllowedRoleClass_roleClassId_fkey"
  FOREIGN KEY ("roleClassId") REFERENCES "RoleClass"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SessionAllowedItemTemplate" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "itemTemplateId" TEXT NOT NULL,

  CONSTRAINT "SessionAllowedItemTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SessionAllowedItemTemplate_sessionId_itemTemplateId_key"
  ON "SessionAllowedItemTemplate"("sessionId", "itemTemplateId");
CREATE INDEX "SessionAllowedItemTemplate_sessionId_idx"
  ON "SessionAllowedItemTemplate"("sessionId");
CREATE INDEX "SessionAllowedItemTemplate_itemTemplateId_idx"
  ON "SessionAllowedItemTemplate"("itemTemplateId");

ALTER TABLE "SessionAllowedItemTemplate"
  ADD CONSTRAINT "SessionAllowedItemTemplate_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionAllowedItemTemplate"
  ADD CONSTRAINT "SessionAllowedItemTemplate_itemTemplateId_fkey"
  FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
