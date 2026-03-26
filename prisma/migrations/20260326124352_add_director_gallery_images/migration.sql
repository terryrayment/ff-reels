-- CreateTable
CREATE TABLE "DirectorGalleryImage" (
    "id" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "brand" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectorGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectorGalleryImage_directorId_idx" ON "DirectorGalleryImage"("directorId");

-- AddForeignKey
ALTER TABLE "DirectorGalleryImage" ADD CONSTRAINT "DirectorGalleryImage_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Director"("id") ON DELETE CASCADE ON UPDATE CASCADE;
