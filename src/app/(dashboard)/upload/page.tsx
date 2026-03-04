import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { UploadManager } from "@/components/upload/upload-manager";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Only admins can access upload
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const directors = await prisma.director.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      projects: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          brand: true,
          agency: true,
          category: true,
          year: true,
          muxPlaybackId: true,
          muxStatus: true,
          thumbnailUrl: true,
          duration: true,
          isPublished: true,
          createdAt: true,
        },
      },
    },
  });

  // Serialize dates for client component
  const serialized = directors.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    projects: d.projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Upload Spots
        </h1>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-[#999]">
          Upload and manage spots per director
        </p>
      </div>

      <UploadManager directors={serialized} />
    </div>
  );
}
