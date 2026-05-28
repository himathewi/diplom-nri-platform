-- Rebuild UserRole with the supported roles only.
UPDATE "User"
SET "role" = 'PARTICIPANT'
WHERE "role"::text NOT IN ('ADMIN', 'MODERATOR', 'PARTICIPANT');

ALTER TYPE "UserRole" RENAME TO "UserRole_old";

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'PARTICIPANT');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole"
  USING ("role"::text::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'PARTICIPANT';

DROP TYPE "UserRole_old";
