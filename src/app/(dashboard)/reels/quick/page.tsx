import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { QuickReelBuilder } from "@/components/reels/quick-reel-builder";

export default async function QuickReelPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "REP"].includes(session.user.role)) {
    redirect("/login");
  }

  const directors = await prisma.director.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      rosterStatus: true,
      headshotUrl: true,
      projects: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          brand: true,
          agency: true,
          category: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          duration: true,
        },
      },
    },
  });

  return <QuickReelBuilder directors={directors} />;
}
