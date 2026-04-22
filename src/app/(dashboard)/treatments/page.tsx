import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { AddTreatmentBar } from "@/components/treatments/add-treatment-bar";
import { DeleteTreatmentButton } from "@/components/treatments/delete-treatment-button";
import { CopyTreatmentLinkButton } from "@/components/treatments/copy-link-button";

export const dynamic = "force-dynamic";

export default async function TreatmentsPage() {
  const session = await getServerSession(authOptions);
  const canManage =
    !!session &&
    (session.user.role === "ADMIN" || session.user.role === "PRODUCER");

  // Get all directors that have treatment samples, grouped by director
  const [directors, allDirectors] = await Promise.all([
    prisma.director.findMany({
      where: { treatmentSamples: { some: {} } },
      orderBy: { name: "asc" },
      include: {
        treatmentSamples: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            _count: { select: { views: true } },
            views: {
              orderBy: { startedAt: "desc" },
              take: 1,
              select: { startedAt: true },
            },
          },
        },
      },
    }),
    // All directors for the "add treatment" picker
    canManage
      ? prisma.director.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const totalCount = directors.reduce(
    (sum, d) => sum + d.treatmentSamples.length,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Treatments
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-[#999] mt-2">
          {totalCount} treatment{totalCount !== 1 ? "s" : ""} across{" "}
          {directors.length} director{directors.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Admin: add treatment bar */}
      {canManage && <AddTreatmentBar directors={allDirectors} />}

      {directors.length > 0 ? (
        <div className="space-y-14">
          {directors.map((director) => (
            <div key={director.id}>
              {/* Director name */}
              <Link
                href={`/directors/${director.id}`}
                className="text-[10px] uppercase tracking-[0.15em] text-[#999] hover:text-[#1A1A1A] transition-colors font-medium"
              >
                {director.name}
              </Link>

              {/* Treatment links */}
              <div className="mt-4">
                {director.treatmentSamples.map((treatment, i) => (
                  <div
                    key={treatment.id}
                    className={`flex items-center justify-between gap-4 py-3.5 group ${
                      i < director.treatmentSamples.length - 1
                        ? "border-b border-[#F0F0EC]"
                        : ""
                    }`}
                  >
                    {/* Left: title + metadata */}
                    <a
                      href={treatment.token ? `/t/${treatment.token}` : treatment.previewUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 flex items-center gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] text-[#1A1A1A] group-hover:text-[#666] transition-colors truncate">
                          {treatment.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {treatment.brand && (
                            <span className="text-[11px] text-[#999]">
                              {treatment.brand}
                            </span>
                          )}
                          {treatment.pageCount && (
                            <span className="text-[11px] text-[#ccc]">
                              {treatment.pageCount} page
                              {treatment.pageCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {treatment.isRedacted && (
                            <span className="text-[10px] text-amber-500 uppercase tracking-wider">
                              Redacted
                            </span>
                          )}
                        </div>
                      </div>
                    </a>

                    {/* Right: view count + branded link pill + timestamp + delete */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {treatment._count.views > 0 && (
                        <span
                          className="hidden md:inline-flex items-center gap-1 text-[10px] text-[#999] tabular-nums"
                          title={
                            treatment.views[0]?.startedAt
                              ? `Last viewed ${timeAgo(treatment.views[0].startedAt)}`
                              : undefined
                          }
                        >
                          <Eye size={10} className="text-[#bbb]" />
                          {treatment._count.views}
                          {treatment.views[0]?.startedAt && (
                            <span className="text-[#ccc] ml-1">
                              · {timeAgo(treatment.views[0].startedAt)}
                            </span>
                          )}
                        </span>
                      )}
                      {treatment.token && (
                        <CopyTreatmentLinkButton token={treatment.token} />
                      )}
                      <span className="hidden md:inline text-[10px] text-[#ccc] uppercase tracking-wider whitespace-nowrap">
                        {timeAgo(treatment.createdAt)}
                      </span>
                      {canManage && (
                        <DeleteTreatmentButton id={treatment.id} title={treatment.title} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <FileText size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">
            No treatments yet
          </h3>
          <p className="text-[12px] text-[#999] mt-1 max-w-sm">
            {canManage
              ? "Paste an InDesign published URL above to add your first treatment."
              : "Treatment samples will appear here once added to director profiles."}
          </p>
        </div>
      )}
    </div>
  );
}
