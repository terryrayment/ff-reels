import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { PhotographerGallery } from "@/components/photographers/photographer-gallery";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PhotographerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const photographer = await prisma.director.findUnique({
    where: { id: params.id },
    include: {
      galleryImages: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!photographer || photographer.galleryImages.length === 0) {
    return notFound();
  }

  const images = photographer.galleryImages.map((img) => ({
    id: img.id,
    url: img.url,
    caption: img.caption,
    brand: img.brand,
  }));

  return (
    <div>
      {/* Back link */}
      <Link
        href="/photographers"
        className="inline-flex items-center gap-1.5 text-[12px] text-[#999] hover:text-[#666] transition-colors mb-6"
      >
        <ArrowLeft size={12} />
        Photographers
      </Link>

      {/* Header */}
      <div className="flex items-start gap-6 mb-10">
        {photographer.headshotUrl && (
          <img
            src={photographer.headshotUrl}
            alt={photographer.name}
            className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-[32px] md:text-[42px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
            {photographer.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="pill-tag">
              <span className="pill-dot" />
              Photographer
            </span>
            {photographer.categories.length > 0 && (
              <span className="text-[11px] text-[#999]">
                {photographer.categories.join(", ")}
              </span>
            )}
          </div>
          {photographer.bio && (
            <p className="text-[13px] text-[#999] mt-4 max-w-2xl leading-relaxed">
              {photographer.bio}
            </p>
          )}
          {photographer.websiteUrl && (
            <a
              href={photographer.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-[12px] text-[#C45A2D] hover:underline"
            >
              {photographer.websiteUrl.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h2 className="text-[11px] font-semibold text-[#666] uppercase tracking-wider mb-5">
          Gallery ({images.length})
        </h2>
        {images.length > 0 ? (
          <PhotographerGallery images={images} editable={isAdmin} directorId={photographer.id} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-[13px] text-[#bbb]">No photos uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
