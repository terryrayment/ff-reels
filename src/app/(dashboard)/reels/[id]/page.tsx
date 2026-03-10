import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScreeningLinksPanel } from "@/components/reels/screening-links-panel";
import { ReelSpotList } from "@/components/reels/reel-spot-list";

export default async function ReelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    include: {
      director: true,
      items: {
        include: { project: true },
        orderBy: { sortOrder: "asc" },
      },
      screeningLinks: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { views: true } },
        },
      },
    },
  });

  if (!reel) return notFound();

  const screeningDomain = process.env.NEXT_PUBLIC_SCREENING_URL || "https://reels.friendsandfamily.tv";

  return (
    <div>
      {/* Back */}
      <Link
        href="/reels"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] hover:text-[#1A1A1A] transition-colors mb-6 md:mb-8"
      >
        <ArrowLeft size={11} />
        Reels
      </Link>

      {/* Header */}
      <div>
        <div>
          <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
            <h1 className="text-2xl md:text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
              {reel.title}
            </h1>
            <span className="text-[10px] text-[#bbb] uppercase tracking-wider">
              {reel.reelType.toLowerCase()}
            </span>
          </div>
          <p className="text-[12px] text-[#999] mt-2">
            <Link
              href={`/directors/${reel.director.id}`}
              className="hover:text-[#1A1A1A] transition-colors"
            >
              {reel.director.name}
            </Link>{" "}
            · {reel.items.length} spot{reel.items.length !== 1 ? "s" : ""}
          </p>
          {(reel.brand || reel.agencyName || reel.campaignName || reel.producer) && (
            <div className="flex items-center gap-4 mt-3 text-[11px] text-[#999]">
              {reel.brand && <span>{reel.brand}</span>}
              {reel.agencyName && <><span className="text-[#ddd]">·</span><span>{reel.agencyName}</span></>}
              {reel.campaignName && <><span className="text-[#ddd]">·</span><span>{reel.campaignName}</span></>}
              {reel.producer && <><span className="text-[#ddd]">·</span><span>Prod: {reel.producer}</span></>}
            </div>
          )}
          {reel.curatorialNote && (
            <p className="text-[13px] text-[#999] mt-4 italic max-w-xl leading-relaxed">
              &ldquo;{reel.curatorialNote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Spots in the reel — drag to reorder */}
      <div className="mt-8 md:mt-12">
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider mb-4 md:mb-5">
          Spots
        </h2>
        <ReelSpotList
          reelId={reel.id}
          items={reel.items.map((item) => ({
            id: item.id,
            projectId: item.projectId,
            title: item.project.title,
            brand: item.project.brand,
            agency: item.project.agency,
            year: item.project.year,
            duration: item.project.duration,
            muxPlaybackId: item.project.muxPlaybackId,
            thumbnailUrl: item.project.thumbnailUrl,
          }))}
        />
      </div>

      {/* Screening Links */}
      <ScreeningLinksPanel
        reelId={reel.id}
        links={reel.screeningLinks.map((l) => ({
          id: l.id,
          token: l.token,
          isActive: l.isActive,
          recipientName: l.recipientName,
          recipientEmail: l.recipientEmail,
          recipientCompany: l.recipientCompany,
          expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
          createdAt: l.createdAt.toISOString(),
          _count: l._count,
        }))}
        screeningDomain={screeningDomain}
      />
    </div>
  );
}
