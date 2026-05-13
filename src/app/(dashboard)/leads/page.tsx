import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ExternalLink, Lock } from "lucide-react";
import { authOptions } from "@/lib/auth/options";
import {
  canAccessLeads,
  getLeadsAirtableUrl,
  getLeadsEmbedUrl,
  getLeadsPasswordHint,
} from "@/lib/leads-access";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!canAccessLeads(session.user)) redirect("/dashboard");

  const airtableUrl = getLeadsAirtableUrl();
  const embedUrl = getLeadsEmbedUrl();
  const passwordHint = getLeadsPasswordHint();

  return (
    <div className="min-h-[calc(100vh-96px)]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-header mb-3">Private pipeline</p>
          <h1 className="text-[42px] md:text-[56px] font-semibold tracking-tight text-[#111] leading-none">
            Leads
          </h1>
          <p className="mt-3 max-w-xl text-[12px] text-[#666]">
            Shared lead tracking from Airtable. Access is limited to approved
            team members.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {passwordHint && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E3E1DA] bg-white px-3 py-2 text-[11px] text-[#555]">
              <Lock size={13} className="text-[#999]" />
              <span className="uppercase tracking-[0.12em] text-[#999]">
                Password
              </span>
              <span className="font-semibold text-[#111]">{passwordHint}</span>
            </div>
          )}
          <a
            href={airtableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#E3E1DA] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#333] transition-colors hover:border-[#111] hover:text-[#111]"
          >
            <ExternalLink size={13} />
            Open Airtable
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#DEDDD7] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <iframe
          title="Friends & Family Leads Airtable"
          src={embedUrl}
          className="h-[calc(100vh-230px)] min-h-[620px] w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
