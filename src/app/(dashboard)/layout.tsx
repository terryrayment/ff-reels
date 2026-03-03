import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-semibold tracking-tight">
            Friends & Family
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Reel Platform</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/dashboard" icon="◻">Dashboard</NavLink>
          <NavLink href="/directors" icon="◻">Directors</NavLink>
          <NavLink href="/reels" icon="◻">Reels</NavLink>
          <NavLink href="/analytics" icon="◻">Analytics</NavLink>
        </nav>

        {/* User */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-sm truncate">{session.user.name ?? session.user.email}</p>
          <p className="text-xs text-white/40 capitalize">{session.user.role?.toLowerCase()}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      <span className="text-white/30">{icon}</span>
      {children}
    </Link>
  );
}
