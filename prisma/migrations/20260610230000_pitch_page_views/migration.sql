-- CreateTable
CREATE TABLE "PitchPageView" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "viewerIp" TEXT,
    "city" TEXT,
    "country" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PitchPageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PitchPageView_slug_createdAt_idx" ON "PitchPageView"("slug", "createdAt");
