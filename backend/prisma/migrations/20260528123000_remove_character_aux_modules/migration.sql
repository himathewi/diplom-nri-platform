DROP TABLE IF EXISTS "CharacterAttack";
DROP TABLE IF EXISTS "CharacterSpell";
DROP TABLE IF EXISTS "CharacterHpIncrease";

ALTER TABLE "Character"
  DROP COLUMN IF EXISTS "spellcastingAbility",
  DROP COLUMN IF EXISTS "deathSaveSuccesses",
  DROP COLUMN IF EXISTS "deathSaveFailures",
  DROP COLUMN IF EXISTS "hitDiceTotal",
  DROP COLUMN IF EXISTS "hitDiceUsed",
  DROP COLUMN IF EXISTS "hitDiceDice",
  DROP COLUMN IF EXISTS "spellSlots";

ALTER TABLE "ItemTemplate"
  DROP COLUMN IF EXISTS "weaponConfig";

ALTER TABLE "CharacterItem"
  DROP COLUMN IF EXISTS "weaponConfig";
