-- CreateTable
CREATE TABLE "UpdateReaction" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpdateReaction_updateId_idx" ON "UpdateReaction"("updateId");

-- CreateIndex
CREATE INDEX "UpdateReaction_userId_idx" ON "UpdateReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UpdateReaction_updateId_userId_emoji_key" ON "UpdateReaction"("updateId", "userId", "emoji");

-- AddForeignKey
ALTER TABLE "UpdateReaction" ADD CONSTRAINT "UpdateReaction_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Update"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateReaction" ADD CONSTRAINT "UpdateReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
