import { prisma } from "@/lib/db";
import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function TreatmentsPage() {
  // Get all directors that have treatment samples, grouped by director
  const directors = await prisma.director.findMany({
    where: {
      treatmentSamples: { some: {} },
    },
    orderBy: { name: "asc" },
    include: {
      treatmentSamples: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Also get ungrouped view for "all treatments" count
  const totalCount = directors.reduce(
    (sum, d) => sum + d.treatmentSamples.length,
    0
  );

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Treatments
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-[#999] mt-2">
          {totalCount} treatment{totalCount !== 1 ? "s" : ""} across{" "}
          {directors.length} director{directors.length !== 1 ? "s" : ""}
        </p>
      </div>

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
                  <a
                    key={treatment.id}
                    href={treatment.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between py-3.5 group ${
                      i < director.treatmentSamples.length - 1
                        ? "border-b border-[#F0F0EC]"
                        : ""
                    }`}
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
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <span className="text-[10px] text-[#ccc] uppercase tracking-wider">
                        {timeAgo(treatment.createdAt)}
                      </span>
                      <ExternalLink
                        size={12}
                        className="text-[#ccc] group-hover:text-[#666] transition-colors"
                      />
                    </div>
                  </a>
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
            Treatment samples will appear here once added to director profiles.
          </p>
        </div>
      )}
    </div>
  );
}
