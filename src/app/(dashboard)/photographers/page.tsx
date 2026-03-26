import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera } from "lucide-react";

export default async function PhotographersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const photographers = await prisma.director.findMany({
    where: { rosterStatus: "PHOTOGRAPHER", isActive: true },
    orderBy: { name: "asc" },
    include: {
      galleryImages: {
        orderBy: { sortOrder: "asc" },
        take: 4,
      },
      _count: { select: { galleryImages: true, projects: true } },
    },
  });

  return (
    <div>
      <div className="mb-14">
        <h1 className="text-[42px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
          Photographers
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="pill-tag">
            <span className="pill-dot" />
            {photographers.length} photographer{photographers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {photographers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {photographers.map((photographer) => {
            const heroImage =
              photographer.galleryImages[0]?.url ||
              photographer.headshotUrl;

            return (
              <Link
                key={photographer.id}
                href={`/photographers/${photographer.id}`}
                className="group content-card overflow-hidden"
              >
                {/* Hero image */}
                <div className="aspect-[4/3] bg-[#EEEDEA] overflow-hidden relative">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={photographer.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={24} className="text-[#ccc]" />
                    </div>
                  )}
                  {/* Thumbnail strip overlay */}
                  {photographer.galleryImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {photographer.galleryImages.slice(1, 4).map((img) => (
                        <div
                          key={img.id}
                          className="w-10 h-10 rounded-md overflow-hidden border-2 border-white/80 shadow-sm"
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-[16px] font-medium text-[#1A1A1A] group-hover:text-black transition-colors">
                    {photographer.name}
                  </h3>
                  <p className="text-[11px] text-[#999] mt-1">
                    {photographer._count.galleryImages} photo{photographer._count.galleryImages !== 1 ? "s" : ""}
                    {photographer.categories.length > 0 && (
                      <span> · {photographer.categories.slice(0, 3).join(", ")}</span>
                    )}
                  </p>
                  {photographer.bio && (
                    <p className="text-[12px] text-[#bbb] mt-2 line-clamp-2">
                      {photographer.bio}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Camera size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">No photographers yet</h3>
          <p className="text-[12px] text-[#999] mt-1">
            Photographers will appear here when added.
          </p>
        </div>
      )}
    </div>
  );
}
