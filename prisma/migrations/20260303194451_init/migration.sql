-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'REP', 'VIEWER');

-- CreateEnum
CREATE TYPE "ReelType" AS ENUM ('PORTFOLIO', 'CUSTOM', 'CATEGORY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Director" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "statement" TEXT,
    "videoIntroUrl" TEXT,
    "headshotUrl" TEXT,
    "categories" TEXT[],
    "awards" JSONB,
    "pressLinks" JSONB,
    "clientLogos" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Director_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT,
    "agency" TEXT,
    "category" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "contextNote" TEXT,
    "muxAssetId" TEXT,
    "muxPlaybackId" TEXT,
    "muxStatus" TEXT DEFAULT 'waiting',
    "duration" DOUBLE PRECISION,
    "aspectRatio" TEXT,
    "r2Key" TEXT,
    "originalFilename" TEXT,
    "fileSizeMb" DOUBLE PRECISION,
    "thumbnailUrl" TEXT,
    "projectAwards" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameGrab" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FrameGrab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookbookItem" (
    "id" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "source" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LookbookItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "curatorialNote" TEXT,
    "reelType" "ReelType" NOT NULL DEFAULT 'CUSTOM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReelItem" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReelItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningLink" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "recipientCompany" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreeningLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReelView" (
    "id" TEXT NOT NULL,
    "screeningLinkId" TEXT NOT NULL,
    "userId" TEXT,
    "viewerIp" TEXT,
    "viewerCity" TEXT,
    "viewerCountry" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalDuration" DOUBLE PRECISION,
    "isForwarded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReelView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotView" (
    "id" TEXT NOT NULL,
    "reelViewId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "watchDuration" DOUBLE PRECISION,
    "totalDuration" DOUBLE PRECISION,
    "percentWatched" DOUBLE PRECISION,
    "rewatched" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSample" (
    "id" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT,
    "previewUrl" TEXT NOT NULL,
    "pageCount" INTEGER,
    "isRedacted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreatmentSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Director_slug_key" ON "Director"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_muxAssetId_key" ON "Project"("muxAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "ReelItem_reelId_projectId_key" ON "ReelItem"("reelId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningLink_token_key" ON "ScreeningLink"("token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Director"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameGrab" ADD CONSTRAINT "FrameGrab_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookbookItem" ADD CONSTRAINT "LookbookItem_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Director"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Director"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelItem" ADD CONSTRAINT "ReelItem_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelItem" ADD CONSTRAINT "ReelItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningLink" ADD CONSTRAINT "ScreeningLink_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelView" ADD CONSTRAINT "ReelView_screeningLinkId_fkey" FOREIGN KEY ("screeningLinkId") REFERENCES "ScreeningLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelView" ADD CONSTRAINT "ReelView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotView" ADD CONSTRAINT "SpotView_reelViewId_fkey" FOREIGN KEY ("reelViewId") REFERENCES "ReelView"("id") ON DELETE CASCADE ON UPDATE CASCADE;
