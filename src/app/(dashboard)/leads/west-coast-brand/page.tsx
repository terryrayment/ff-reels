import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ExternalLink } from "lucide-react";
import { authOptions } from "@/lib/auth/options";
import { canAccessLeads } from "@/lib/leads-access";
import { WEST_COAST_BRAND_PROJECT } from "@/lib/github-projects";
import { GitHubProjectTable } from "@/components/leads/github-project-table";

export default async function WestCoastBrandLeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!canAccessLeads(session.user)) redirect("/dashboard");

  return (
    <div className="min-h-[calc(100vh-96px)]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-header mb-3">Private pipeline</p>
          <h1 className="text-[42px] md:text-[56px] font-semibold tracking-tight text-[#111] leading-none">
            Leads
          </h1>
          <p className="mt-3 max-w-xl text-[12px] text-[#666]">
            WEST COAST - BRAND
          </p>
        </div>
        <a
          href={WEST_COAST_BRAND_PROJECT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#E3E1DA] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#333] transition-colors hover:border-[#111] hover:text-[#111]"
        >
          <ExternalLink size={13} />
          Open GitHub
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#DEDDD7] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <GitHubProjectTable />
      </div>
    </div>
  );
}
