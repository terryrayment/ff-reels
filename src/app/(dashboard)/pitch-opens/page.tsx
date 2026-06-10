import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { PITCH_COMPANIES } from "@/lib/pitch/companies";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Pitch Opens" };

/**
 * Pitch Opens — who has opened the founder-outreach pitch pages.
 * Opens are recorded by a client-side beacon, so email link-scanner
 * bots are already filtered out.
 */
export default async function PitchOpensPage() {
  const session = await getServerSession(authOptions);
  const isTeam =
    session && ["ADMIN", "PRODUCER", "REP"].includes(session.user.role);
  if (!isTeam) redirect("/dashboard");

  const [bySlug, recent] = await Promise.all([
    prisma.pitchPageView.groupBy({
      by: ["slug"],
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    prisma.pitchPageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const countsBySlug = new Map(
    bySlug.map((row) => [
      row.slug,
      { count: row._count._all, last: row._max.createdAt },
    ]),
  );

  // Every pitch page, opened or not, so the zeroes are visible too.
  const allSlugs = [...Object.keys(PITCH_COMPANIES), "versant"];
  const rows = allSlugs
    .map((slug) => ({
      slug,
      company: PITCH_COMPANIES[slug]?.company ?? "Versant Sports",
      recipient: PITCH_COMPANIES[slug]?.recipientName ?? "—",
      count: countsBySlug.get(slug)?.count ?? 0,
      last: countsBySlug.get(slug)?.last ?? null,
    }))
    .sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Pitch Opens</h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          Opens on the founder-outreach pitch pages. Recorded in-browser, so
          email scanners don&apos;t count. A visit basically means the
          recipient, or someone they forwarded it to.
        </p>
      </div>

      <div className="mb-10 overflow-hidden rounded-xl border border-[#1A1A1A]/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A1A1A]/10 bg-[#F7F6F3] text-left text-xs uppercase tracking-wide text-[#1A1A1A]/50">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3 text-right">Opens</th>
              <th className="px-4 py-3 text-right">Last open</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.slug}
                className="border-b border-[#1A1A1A]/5 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{row.company}</td>
                <td className="px-4 py-3 text-[#1A1A1A]/70">{row.recipient}</td>
                <td className="px-4 py-3">
                  <a
                    href={`https://reels.friendsandfamily.tv/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A1A1A]/60 underline-offset-2 hover:underline"
                  >
                    /{row.slug}
                  </a>
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${
                    row.count > 0 ? "font-semibold" : "text-[#1A1A1A]/35"
                  }`}
                >
                  {row.count}
                </td>
                <td className="px-4 py-3 text-right text-[#1A1A1A]/60">
                  {row.last ? timeAgo(row.last) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1A1A1A]/50">
        Recent activity
      </h2>
      <div className="overflow-hidden rounded-xl border border-[#1A1A1A]/10 bg-white">
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#1A1A1A]/50">
            No opens recorded yet. The beacon went live with this deploy, so
            opens start counting from now.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1A1A]/10 bg-[#F7F6F3] text-left text-xs uppercase tracking-wide text-[#1A1A1A]/50">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Device</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((view) => (
                <tr
                  key={view.id}
                  className="border-b border-[#1A1A1A]/5 last:border-0"
                >
                  <td className="px-4 py-3 text-[#1A1A1A]/70">
                    {timeAgo(view.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">/{view.slug}</td>
                  <td className="px-4 py-3 text-[#1A1A1A]/70">
                    {[view.city, view.country].filter(Boolean).join(", ") ||
                      "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-[#1A1A1A]/70">
                    {view.device ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
