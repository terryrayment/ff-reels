import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { ContactsTable, type ContactRow } from "@/components/contacts/contacts-table";

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const contacts = await prisma.contact.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      company: { select: { id: true, name: true } },
      screeningLinks: {
        select: {
          id: true,
          createdAt: true,
          reel: { select: { directorId: true } },
          views: {
            select: {
              startedAt: true,
              totalDuration: true,
              spotViews: { select: { percentWatched: true }, take: 20 },
            },
          },
          _count: { select: { views: true } },
        },
      },
    },
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

  // Compute per-contact row data
  const rows: ContactRow[] = contacts.map((c) => {
    const totalViews = c.screeningLinks.reduce(
      (sum, l) => sum + l._count.views,
      0
    );
    const reelsSent = c.screeningLinks.length;

    // Flatten all views
    const allViews = c.screeningLinks.flatMap((l) => l.views);

    // Avg completion
    const allCompletions = allViews.flatMap((v) =>
      v.spotViews.map((sv) => sv.percentWatched).filter((p): p is number => p != null)
    );
    const avgCompletionPct =
      allCompletions.length > 0
        ? Math.round(allCompletions.reduce((s, p) => s + p, 0) / allCompletions.length)
        : null;

    // Last active
    const viewDates = allViews.map((v) => v.startedAt.getTime());
    const lastActive = viewDates.length > 0
      ? new Date(Math.max(...viewDates)).toISOString()
      : null;

    // Unique directors
    const directorIds = new Set(c.screeningLinks.map((l) => l.reel.directorId));
    const uniqueDirectors = directorIds.size;

    // Hot: 3+ views this week, or views across 2+ directors
    const recentViews = allViews.filter(
      (v) => v.startedAt.getTime() > oneWeekAgo.getTime()
    ).length;
    const isHot = recentViews >= 3 || (uniqueDirectors >= 2 && totalViews >= 2);

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company?.name || null,
      role: c.role,
      totalViews,
      reelsSent,
      avgCompletionPct,
      lastActive,
      uniqueDirectors,
      isHot,
    };
  });

  const companyCount = new Set(contacts.map((c) => c.company?.name).filter(Boolean)).size;

  return (
    <div>
      <div className="mb-10 md:mb-14">
        <h1 className="text-[32px] md:text-[56px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-[1.05]">
          Contacts
        </h1>
        <div className="flex items-center gap-3 mt-2 md:mt-3">
          <span className="pill-tag">
            <span className="pill-dot" />
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </span>
          {companyCount > 0 && (
            <span className="pill-tag">
              <span className="pill-dot" />
              {companyCount} compan{companyCount !== 1 ? "ies" : "y"}
            </span>
          )}
        </div>
      </div>

      <ContactsTable rows={rows} />
    </div>
  );
}
