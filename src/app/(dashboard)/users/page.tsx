import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { UsersPanel } from "../industry/users-panel";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role?: string; id?: string })?.role || "VIEWER";
  const userId = (session.user as { id?: string })?.id || "";
  if (role !== "ADMIN") redirect("/dashboard");

  const [users, directors] = await Promise.all([
    prisma.user.findMany({
      where: { role: { not: "VIEWER" } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        inviteToken: true,
        inviteTokenExpires: true,
        directorId: true,
        director: { select: { name: true } },
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.director.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    directorName: u.director?.name || null,
    status: u.passwordHash ? "active" : "invited",
    invitePending: !u.passwordHash,
    inviteExpired: !u.passwordHash && u.inviteTokenExpires
      ? u.inviteTokenExpires < new Date()
      : false,
    lastActiveAt: u.lastActiveAt?.toISOString() || null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-medium tracking-tight text-[#1A1A1A]">
          Users
        </h1>
        <p className="text-[12px] text-[#999] mt-1">
          Invite and manage team members
        </p>
      </div>

      <UsersPanel initialUsers={serializedUsers} currentUserId={userId} directors={directors} />
    </div>
  );
}
