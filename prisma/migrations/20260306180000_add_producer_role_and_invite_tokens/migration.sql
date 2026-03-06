-- Add PRODUCER to the Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PRODUCER';

-- Add invite token fields to User
ALTER TABLE "User" ADD COLUMN "inviteToken" TEXT;
ALTER TABLE "User" ADD COLUMN "inviteTokenExpires" TIMESTAMP(3);

-- Create unique index on inviteToken
CREATE UNIQUE INDEX "User_inviteToken_key" ON "User"("inviteToken");
