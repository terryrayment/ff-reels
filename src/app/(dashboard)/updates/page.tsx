import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { timeAgo } from "@/lib/utils";
import { Film, Users, Send, Pin, Megaphone } from "lucide-react";
import { PostUpdateForm } from "@/components/updates/post-update-form";

export default async function UpdatesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const updates = await prisma.update.findMany({
    take: 50,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      director: { select: { id: true, name: true } },
      project: { select: { id: true, title: true, brand: true, muxPlaybackId: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });

  const directors = isAdmin
    ? await prisma.director.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  // Stats for the top
  const [spotCount, reelCount, directorCount] = await Promise.all([
    prisma.project.count(),
    prisma.reel.count(),
    prisma.director.count({ where: { isActive: true } }),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[#1A1A1A]">Updates</h1>
          <p className="text-sm text-[#999] mt-1">
            Latest activity and announcements for the team.
          </p>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-3 p-4 bg-white border border-[#E8E8E3] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#F7F6F3] flex items-center justify-center">
            <Users size={18} className="text-[#999]" />
          </div>
          <div>
            <p className="text-2xl font-light text-[#1A1A1A]">{directorCount}</p>
            <p className="text-xs text-[#999]">Directors on roster</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white border border-[#E8E8E3] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#F7F6F3] flex items-center justify-center">
            <Film size={18} className="text-[#999]" />
          </div>
          <div>
            <p className="text-2xl font-light text-[#1A1A1A]">{spotCount}</p>
            <p className="text-xs text-[#999]">Total spots</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white border border-[#E8E8E3] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#F7F6F3] flex items-center justify-center">
            <Send size={18} className="text-[#999]" />
          </div>
          <div>
            <p className="text-2xl font-light text-[#1A1A1A]">{reelCount}</p>
            <p className="text-xs text-[#999]">Reels built</p>
          </div>
        </div>
      </div>

      {/* Admin post form */}
      {isAdmin && <PostUpdateForm directors={directors} />}

      {/* Updates feed */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-[#999] uppercase tracking-wider mb-4">
          Activity Feed
        </h2>

        {updates.length > 0 ? (
          <div className="space-y-3">
            {updates.map((update) => (
              <div
                key={update.id}
                className={`p-5 bg-white border rounded-xl ${
                  update.isPinned
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-[#E8E8E3]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    update.type === "ADMIN_NOTE"
                      ? "bg-blue-50"
                      : update.type === "SPOT_ADDED"
                        ? "bg-emerald-50"
                        : update.type === "REEL_CREATED"
                          ? "bg-purple-50"
                          : "bg-[#F7F6F3]"
                  }`}>
                    {update.type === "ADMIN_NOTE" ? (
                      <Megaphone size={16} className="text-blue-600" />
                    ) : update.type === "SPOT_ADDED" ? (
                      <Film size={16} className="text-emerald-600" />
                    ) : update.type === "REEL_CREATED" ? (
                      <Send size={16} className="text-purple-600" />
                    ) : (
                      <Users size={16} className="text-[#666]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[#1A1A1A]">
                        {update.title}
                      </h3>
                      {update.isPinned && (
                        <Pin size={12} className="text-amber-500" />
                      )}
                    </div>

                    {update.body && (
                      <p className="text-sm text-[#666] mt-1 leading-relaxed whitespace-pre-wrap">
                        {update.body}
                      </p>
                    )}

                    {/* Thumbnail for spots */}
                    {update.project?.muxPlaybackId && (
                      <div className="mt-3 w-48 aspect-video rounded-lg overflow-hidden bg-[#EEEDEA]">
                        <img
                          src={`https://image.mux.com/${update.project.muxPlaybackId}/thumbnail.jpg?width=384&height=216&fit_mode=smartcrop`}
                          alt={update.project.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Image for admin notes */}
                    {update.imageUrl && (
                      <div className="mt-3 max-w-md rounded-lg overflow-hidden">
                        <img
                          src={update.imageUrl}
                          alt=""
                          className="w-full h-auto"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#999]">
                      <span>{timeAgo(update.createdAt)}</span>
                      {update.director && (
                        <>
                          <span className="text-[#E8E8E3]">·</span>
                          <a
                            href={`/directors/${update.director.id}`}
                            className="hover:text-[#1A1A1A] transition-colors"
                          >
                            {update.director.name}
                          </a>
                        </>
                      )}
                      {update.author && (
                        <>
                          <span className="text-[#E8E8E3]">·</span>
                          <span>{update.author.name || update.author.email}</span>
                        </>
                      )}
                      {update.type === "ADMIN_NOTE" && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                          Note
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-[#E8E8E3]">
            <Megaphone size={28} className="mx-auto text-[#ccc] mb-3" />
            <p className="text-sm text-[#666]">No updates yet</p>
            <p className="text-xs text-[#999] mt-1">
              Activity will appear here as spots are uploaded and reels are created.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
