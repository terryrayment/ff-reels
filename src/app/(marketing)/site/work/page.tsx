import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Work" };
export const revalidate = 300;

async function getWork() {
  return prisma.project.findMany({
    where: {
      muxStatus: "ready",
      director: { isActive: true, rosterStatus: "ROSTER" },
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    take: 80,
    select: {
      id: true,
      title: true,
      brand: true,
      year: true,
      thumbnailUrl: true,
      muxPlaybackId: true,
      director: { select: { slug: true, name: true } },
    },
  });
}

export default async function WorkPage() {
  const projects = await getWork();

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-32 lg:pt-40 pb-24">
      <header className="mb-16 flex items-baseline justify-between gap-6">
        <h1 className="text-[40px] md:text-[56px] tracking-tight-3 font-light text-[#1A1A1A]">
          Work
        </h1>
        <p className="text-[12px] uppercase tracking-[0.14em] text-[#999]">
          {projects.length} projects
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="border border-dashed border-[#E8E7E3] py-24 text-center">
          <p className="text-[14px] text-[#999]">No projects published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {projects.map((p) => {
            const still =
              p.thumbnailUrl ??
              (p.muxPlaybackId
                ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=800`
                : null);
            return (
              <Link
                key={p.id}
                href={`/site/directors/${p.director.slug}`}
                className="group block"
              >
                <div className="relative aspect-video overflow-hidden bg-[#EEEDEA]">
                  {still && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={still}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
                <div className="mt-2.5">
                  <p className="text-[13px] tracking-tight-2 text-[#1A1A1A] leading-tight">
                    {p.brand ? `${p.brand} — ` : ""}
                    {p.title}
                  </p>
                  <p className="text-[11px] text-[#999] mt-0.5">
                    {p.director.name}
                    {p.year ? ` · ${p.year}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
